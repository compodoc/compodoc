import { Inject, Injectable, isDevMode, OnDestroy, Optional } from '@angular/core';
import { Params } from '@angular/router';
import { EMPTY, from, Observable, Subject } from 'rxjs';
import {
    catchError,
    concatMap,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    startWith,
    switchMap,
    takeUntil,
    tap
} from 'rxjs/operators';
import { compareParamMaps, filterParamMap, isMissing, isPresent, NOP } from '../util';
import { Unpack } from '../types';
import { QueryParamGroup } from '../model/query-param-group';
import { QueryParam } from '../model/query-param';
import {
    NGQP_ROUTER_ADAPTER,
    NGQP_ROUTER_OPTIONS,
    RouterAdapter,
    RouterOptions
} from '../router-adapter/router-adapter.interface';
import { QueryParamAccessor } from './query-param-accessor.interface';

/** @internal */
function isMultiQueryParam<T>(
    queryParam: QueryParam<T> | QueryParam<T[]>
): queryParam is QueryParam<T[]> {
    return queryParam.multi;
}

/** @internal */
function hasArrayValue<T>(
    queryParam: QueryParam<T> | QueryParam<T[]>,
    value: T | T[]
): value is T[] {
    return isMultiQueryParam(queryParam);
}

/** @internal */
function hasArraySerialization(
    queryParam: QueryParam<any>,
    values: string | string[] | null
): values is string[] {
    return isMultiQueryParam(queryParam);
}

/** @internal */
class NavigationData {
    constructor(public params: Params, public synthetic: boolean = false) {}
}

/**
 * Service implementing the synchronization logic
 *
 * This service is the key to the synchronization process by binding a {@link QueryParamGroup}
 * to the router.
 *
 * @internal
 */
@Injectable()
export class QueryParamGroupService implements OnDestroy {
    /** The {@link QueryParamGroup} to bind. */
    private queryParamGroup: QueryParamGroup;

    /** List of {@link QueryParamAccessor} registered to this service. */
    private directives = new Map<string, QueryParamAccessor[]>();

    /**
     * Queue of navigation parameters
     *
     * A queue is used for navigations as we need to make sure all parameter changes
     * are executed in sequence as otherwise navigations might overwrite each other.
     */
    private queue$ = new Subject<NavigationData>();

    /** @ignore */
    private synchronizeRouter$ = new Subject<void>();

    /** @ignore */
    private destroy$ = new Subject<void>();

    constructor(
        @Inject(NGQP_ROUTER_ADAPTER) private routerAdapter: RouterAdapter,
        @Optional() @Inject(NGQP_ROUTER_OPTIONS) private globalRouterOptions: RouterOptions
    ) {
        this.setupNavigationQueue();
    }

    /** @ignore */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        this.synchronizeRouter$.complete();

        if (this.queryParamGroup) {
            this.queryParamGroup._clearChangeFunctions();
        }
    }

    /**
     * Uses the given {@link QueryParamGroup} for synchronization.
     */
    public setQueryParamGroup(queryParamGroup: QueryParamGroup): void {
        // FIXME: If this is called when we already have a group, we probably need to do
        //        some cleanup first.
        if (this.queryParamGroup) {
            throw new Error(
                `A QueryParamGroup has already been setup. Changing the group is currently not supported.`
            );
        }

        this.queryParamGroup = queryParamGroup;
        this.startSynchronization();
    }

    /**
     * Registers a {@link QueryParamAccessor}.
     */
    public registerQueryParamDirective(directive: QueryParamAccessor): void {
        // Capture the name here, particularly for the queue below to avoid re-evaluating
        // it as it might change over time.
        const queryParamName = directive.name;

        const queryParam: QueryParam<any> = this.queryParamGroup.get(queryParamName);
        if (!queryParam) {
            throw new Error(
                `Could not find query param with name ${queryParamName}. Did you forget to add it to your QueryParamGroup?`
            );
        }
        if (!directive.valueAccessor) {
            throw new Error(
                `No value accessor found for the form control. Please make sure to implement ControlValueAccessor on this component.`
            );
        }

        // Chances are that we read the initial route before a directive has been registered here.
        // The value in the model will be correct, but we need to sync it to the view once initially.
        directive.valueAccessor.writeValue(queryParam.value);

        // Proxy updates from the view to debounce them (if needed).
        const debouncedQueue$ = new Subject<any>();
        debouncedQueue$
            .pipe(
                // Do not synchronize while the param is detached from the group
                filter(() => !!this.queryParamGroup.get(queryParamName)),

                isPresent(queryParam.debounceTime) ? debounceTime(queryParam.debounceTime) : tap(),
                map((newValue: any) => this.getParamsForValue(queryParam, newValue)),
                takeUntil(this.destroy$)
            )
            .subscribe(params => this.enqueueNavigation(new NavigationData(params)));

        directive.valueAccessor.registerOnChange((newValue: any) => debouncedQueue$.next(newValue));

        this.directives.set(queryParamName, [
            ...(this.directives.get(queryParamName) || []),
            directive
        ]);
    }

    /**
     * Deregisters a {@link QueryParamAccessor} by referencing its name.
     */
    public deregisterQueryParamDirective(queryParamName: string): void {
        if (!queryParamName) {
            return;
        }

        const directives = this.directives.get(queryParamName);
        if (!directives) {
            return;
        }

        directives.forEach(directive => {
            directive.valueAccessor.registerOnChange(NOP);
            directive.valueAccessor.registerOnTouched(NOP);
        });

        this.directives.delete(queryParamName);
        const queryParam: QueryParam<any> = this.queryParamGroup.get(queryParamName);
        if (queryParam) {
            queryParam._clearChangeFunctions();
        }
    }

    private startSynchronization() {
        this.setupGroupChangeListener();
        this.setupParamChangeListeners();
        this.setupRouterListener();

        this.watchNewParams();
    }

    /** Listens for programmatic changes on group level and synchronizes to the router. */
    private setupGroupChangeListener(): void {
        this.queryParamGroup._registerOnChange((newValue: Record<string, any>) => {
            let params: Params = {};
            Object.keys(newValue).forEach(queryParamName => {
                const queryParam: QueryParam<any> = this.queryParamGroup.get(queryParamName);
                if (isMissing(queryParam)) {
                    return;
                }

                params = {
                    ...params,
                    ...this.getParamsForValue(queryParam, newValue[queryParamName])
                };
            });

            this.enqueueNavigation(new NavigationData(params, true));
        });
    }

    /** Listens for programmatic changes on parameter level and synchronizes to the router. */
    private setupParamChangeListeners(): void {
        Object.keys(this.queryParamGroup.queryParams).forEach(queryParamName =>
            this.setupParamChangeListener(queryParamName)
        );
    }

    private setupParamChangeListener(queryParamName: string): void {
        const queryParam: QueryParam<any> = this.queryParamGroup.get(queryParamName);
        if (!queryParam) {
            throw new Error(`No param in group found for name ${queryParamName}`);
        }

        queryParam._registerOnChange((newValue: any) =>
            this.enqueueNavigation(
                new NavigationData(this.getParamsForValue(queryParam, newValue), true)
            )
        );
    }

    /** Listens for changes in the router and synchronizes to the model. */
    private setupRouterListener(): void {
        this.synchronizeRouter$
            .pipe(
                startWith(undefined),
                switchMap(() =>
                    this.routerAdapter.queryParamMap.pipe(
                        // We want to ignore changes to query parameters which aren't related to this
                        // particular group; however, we do need to react if one of our parameters has
                        // vanished when it was set before.
                        distinctUntilChanged((previousMap, currentMap) => {
                            const keys = Object.values(this.queryParamGroup.queryParams).map(
                                queryParam => queryParam.urlParam
                            );

                            // It is important that we filter the maps only here so that both are filtered
                            // with the same set of keys; otherwise, e.g. removing a parameter from the group
                            // would interfere.
                            return compareParamMaps(
                                filterParamMap(previousMap, keys),
                                filterParamMap(currentMap, keys)
                            );
                        })
                    )
                ),
                takeUntil(this.destroy$)
            )
            .subscribe(queryParamMap => {
                const synthetic = this.isSyntheticNavigation();
                const groupValue: Record<string, any> = {};

                Object.keys(this.queryParamGroup.queryParams).forEach(queryParamName => {
                    const queryParam: QueryParam<any> = this.queryParamGroup.get(queryParamName);
                    const newValue = queryParam.multi
                        ? this.deserialize(queryParam, queryParamMap.getAll(queryParam.urlParam))
                        : this.deserialize(queryParam, queryParamMap.get(queryParam.urlParam));

                    const directives = this.directives.get(queryParamName);
                    if (directives) {
                        directives.forEach(directive =>
                            directive.valueAccessor.writeValue(newValue)
                        );
                    }

                    groupValue[queryParamName] = newValue;
                });

                this.queryParamGroup.setValue(groupValue, {
                    emitEvent: !synthetic,
                    emitModelToViewChange: false
                });
            });
    }

    /** Listens for newly added parameters and starts synchronization for them. */
    private watchNewParams(): void {
        this.queryParamGroup.queryParamAdded$
            .pipe(takeUntil(this.destroy$))
            .subscribe(queryParamName => {
                this.setupParamChangeListener(queryParamName);
                this.synchronizeRouter$.next();
            });
    }

    /** Returns true if the current navigation is synthetic. */
    private isSyntheticNavigation(): boolean {
        const navigation = this.routerAdapter.getCurrentNavigation();
        if (!navigation || navigation.trigger !== 'imperative') {
            // When using the back / forward buttons, the state is passed along with it, even though
            // for us it's now a navigation initiated by the user. Therefore, a navigation can only
            // be synthetic if it has been triggered imperatively.
            // See https://github.com/angular/angular/issues/28108.
            return false;
        }

        return navigation.extras && navigation.extras.state && navigation.extras.state['synthetic'];
    }

    /** Subscribes to the parameter queue and executes navigations in sequence. */
    private setupNavigationQueue() {
        this.queue$
            .pipe(
                takeUntil(this.destroy$),
                concatMap(data => this.navigateSafely(data))
            )
            .subscribe();
    }

    private navigateSafely(data: NavigationData): Observable<any> {
        return from(
            this.routerAdapter.navigate(data.params, {
                ...this.routerOptions,
                state: { synthetic: data.synthetic }
            })
        ).pipe(
            catchError((err: any) => {
                if (isDevMode()) {
                    console.error(`There was an error while navigating`, err);
                }

                return EMPTY;
            })
        );
    }

    /** Sends a change of parameters to the queue. */
    private enqueueNavigation(data: NavigationData): void {
        this.queue$.next(data);
    }

    /**
     * Returns the full set of parameters given a value for a parameter model.
     *
     * This consists mainly of properly serializing the model value and ensuring to take
     * side effect changes into account that may have been configured.
     */
    private getParamsForValue<T>(queryParam: QueryParam<any>, value: T | undefined | null): Params {
        const newValue = this.serialize(queryParam, value);

        const combinedParams: Params = isMissing(queryParam.combineWith)
            ? {}
            : queryParam.combineWith(value);

        // Note that we list the side-effect parameters first so that our actual parameter can't be
        // overridden by it.
        return {
            ...(combinedParams || {}),
            [queryParam.urlParam]: newValue
        };
    }

    private serialize<T>(queryParam: QueryParam<any>, value: T): string | string[] {
        if (hasArrayValue(queryParam, value)) {
            return (value || []).map(queryParam.serialize);
        } else {
            return queryParam.serialize(value);
        }
    }

    private deserialize<T>(
        queryParam: QueryParam<T>,
        values: string | string[]
    ): Unpack<T> | Unpack<T>[] {
        if (hasArraySerialization(queryParam, values)) {
            return values.map(queryParam.deserialize);
        } else {
            return queryParam.deserialize(values);
        }
    }

    /**
     * Returns the current set of options to pass to the router.
     *
     * This merges the global configuration with the group specific configuration.
     */
    private get routerOptions(): RouterOptions {
        const groupOptions = this.queryParamGroup ? this.queryParamGroup.routerOptions : {};

        return {
            ...(this.globalRouterOptions || {}),
            ...groupOptions
        };
    }
}
