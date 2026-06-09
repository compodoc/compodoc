export interface SessionTemplateMockData {
    templateVariables: any;
    additionalContext: any;
}

export function createSessionTemplateMockData(templateName: string): SessionTemplateMockData {
    let additionalContext: any = {};
    let templateVariables: any;

    if (templateName.includes('component')) {
        templateVariables = {
            // Core component data
            name: 'UserProfileComponent',
            description:
                'A comprehensive user profile management component that handles user information display and editing capabilities.',
            file: 'src/app/components/user-profile/user-profile.component.ts',
            selector: 'app-user-profile',
            templateUrl: './user-profile.component.html',
            styleUrls: ['./user-profile.component.scss', './user-profile.theme.scss'],
            encapsulation: 'ViewEncapsulation.Emulated',
            changeDetection: 'ChangeDetectionStrategy.OnPush',

            // Component metadata
            type: 'component',
            sourceCode:
                'export class UserProfileComponent implements OnInit, OnDestroy { ... }',
            rawFile: 'user-profile.component.ts',

            // Template and styles
            templateData:
                '<div class="user-profile">\\n  <h2>{{user.name}}</h2>\\n  <p>{{user.email}}</p>\\n</div>',
            styleUrlsData: [
                '.user-profile { padding: 20px; }\\n.user-profile h2 { color: #333; }'
            ],
            stylesData: [':host { display: block; margin: 10px; }'],

            // Inputs and Outputs
            inputs: [
                {
                    name: 'user',
                    type: 'User',
                    description: 'The user object containing profile information',
                    decorators: ['@Input()'],
                    optional: false,
                    defaultValue: null
                },
                {
                    name: 'editable',
                    type: 'boolean',
                    description: 'Whether the profile can be edited',
                    decorators: ['@Input()'],
                    optional: true,
                    defaultValue: 'false'
                },
                {
                    name: 'showAvatar',
                    type: 'boolean',
                    description: 'Controls avatar visibility',
                    decorators: ['@Input()'],
                    optional: true,
                    defaultValue: 'true'
                }
            ],
            outputs: [
                {
                    name: 'userUpdated',
                    type: 'EventEmitter<User>',
                    description: 'Emitted when user profile is updated',
                    decorators: ['@Output()']
                },
                {
                    name: 'avatarClicked',
                    type: 'EventEmitter<MouseEvent>',
                    description: 'Emitted when user clicks on avatar',
                    decorators: ['@Output()']
                }
            ],

            // Methods
            methods: [
                {
                    name: 'ngOnInit',
                    type: 'void',
                    description: 'Angular lifecycle hook for component initialization',
                    args: [],
                    returnType: 'void',
                    modifierKind: 'public'
                },
                {
                    name: 'updateProfile',
                    type: 'Promise<void>',
                    description: 'Updates the user profile with new information',
                    args: [{ name: 'userData', type: 'Partial<User>' }],
                    returnType: 'Promise<void>',
                    modifierKind: 'public'
                },
                {
                    name: 'validateForm',
                    type: 'boolean',
                    description: 'Validates the profile form data',
                    args: [],
                    returnType: 'boolean',
                    modifierKind: 'private'
                }
            ],

            // Properties
            properties: [
                {
                    name: 'isLoading',
                    type: 'boolean',
                    description: 'Indicates if component is in loading state',
                    defaultValue: 'false',
                    modifierKind: 'public'
                },
                {
                    name: 'form',
                    type: 'FormGroup',
                    description: 'Reactive form for user profile editing',
                    modifierKind: 'public'
                }
            ],

            // Host listeners and bindings
            hostListeners: [
                {
                    name: 'click',
                    args: ['$event'],
                    description: 'Handles click events on the component'
                }
            ],
            hostBindings: [
                {
                    name: 'class.active',
                    value: 'isActive'
                }
            ],

            // Lifecycle hooks
            implements: ['OnInit', 'OnDestroy', 'AfterViewInit'],

            // Dependency injection
            constructorObj: {
                name: 'constructor',
                description: 'Component constructor with dependency injection',
                args: [
                    { name: 'userService', type: 'UserService' },
                    { name: 'router', type: 'Router' },
                    { name: 'cd', type: 'ChangeDetectorRef' }
                ]
            },

            // Angular-specific metadata
            providers: ['UserService'],
            viewProviders: [],
            queries: [],
            exportAs: 'userProfile',

            // Documentation metadata
            jsdoctags: [
                {
                    tagName: { text: 'example' },
                    comment:
                        '<app-user-profile [user]="currentUser" [editable]="true"></app-user-profile>'
                }
            ],

            // Coverage information (if enabled)
            coveragePercent: 85,
            coverageCount: '17/20',
            status: 'good'
        };

        additionalContext = {
            depth: 1,
            breadcrumbs: [
                { name: 'Components', url: '../components.html' },
                { name: 'UserProfileComponent', url: '#' }
            ]
        };
    } else if (templateName.includes('service') || templateName.includes('injectable')) {
        templateVariables = {
            name: 'UserService',
            description:
                'Service responsible for managing user data and authentication operations',
            file: 'src/app/services/user.service.ts',
            type: 'injectable',

            // Injectable metadata
            providedIn: 'root',
            decorators: ['@Injectable()'],

            // Methods
            methods: [
                {
                    name: 'getUser',
                    type: 'Observable<User>',
                    description: 'Retrieves user data by ID',
                    args: [{ name: 'id', type: 'string' }],
                    returnType: 'Observable<User>',
                    modifierKind: 'public'
                },
                {
                    name: 'updateUser',
                    type: 'Observable<User>',
                    description: 'Updates user information',
                    args: [
                        { name: 'id', type: 'string' },
                        { name: 'userData', type: 'Partial<User>' }
                    ],
                    returnType: 'Observable<User>',
                    modifierKind: 'public'
                },
                {
                    name: 'deleteUser',
                    type: 'Observable<void>',
                    description: 'Deletes a user account',
                    args: [{ name: 'id', type: 'string' }],
                    returnType: 'Observable<void>',
                    modifierKind: 'public'
                }
            ],

            // Properties
            properties: [
                {
                    name: 'currentUser$',
                    type: 'BehaviorSubject<User | null>',
                    description: 'Observable stream of current user state',
                    modifierKind: 'private'
                },
                {
                    name: 'apiUrl',
                    type: 'string',
                    description: 'Base URL for user API endpoints',
                    defaultValue: '"/api/users"',
                    modifierKind: 'private'
                }
            ],

            // Constructor
            constructorObj: {
                name: 'constructor',
                description: 'Service constructor with HTTP client injection',
                args: [
                    { name: 'http', type: 'HttpClient' },
                    { name: 'config', type: 'AppConfig' }
                ]
            },

            // Coverage
            coveragePercent: 92,
            coverageCount: '23/25'
        };
    } else if (templateName.includes('module')) {
        templateVariables = {
            name: 'UserModule',
            description: 'Feature module containing user-related components and services',
            file: 'src/app/modules/user/user.module.ts',
            type: 'module',

            // Module metadata
            declarations: [
                { name: 'UserProfileComponent', type: 'component' },
                { name: 'UserListComponent', type: 'component' },
                { name: 'UserCardDirective', type: 'directive' }
            ],
            imports: [
                { name: 'CommonModule', type: 'module' },
                { name: 'ReactiveFormsModule', type: 'module' },
                { name: 'RouterModule', type: 'module' }
            ],
            exports: [
                { name: 'UserProfileComponent', type: 'component' },
                { name: 'UserListComponent', type: 'component' }
            ],
            providers: [
                { name: 'UserService', type: 'service' },
                { name: 'UserResolver', type: 'resolver' }
            ],
            bootstrap: [],
            schemas: []
        };
    } else if (templateName.includes('interface')) {
        templateVariables = {
            name: 'User',
            description: 'Interface defining the structure of user objects',
            file: 'src/app/interfaces/user.interface.ts',
            type: 'interface',

            // Interface properties
            properties: [
                {
                    name: 'id',
                    type: 'string',
                    description: 'Unique identifier for the user',
                    optional: false
                },
                {
                    name: 'email',
                    type: 'string',
                    description: 'User email address',
                    optional: false
                },
                {
                    name: 'name',
                    type: 'string',
                    description: 'Full name of the user',
                    optional: false
                },
                {
                    name: 'avatar',
                    type: 'string',
                    description: 'URL to user avatar image',
                    optional: true
                },
                {
                    name: 'role',
                    type: 'UserRole',
                    description: 'User role permissions',
                    optional: true
                }
            ],

            // Interface methods (if any)
            methods: [],

            // Index signatures
            indexSignatures: []
        };
    } else {
        // Generic data for other templates (directive, pipe, guard, etc.)
        templateVariables = {
            name: 'ExampleItem',
            description: 'A sample item for demonstration purposes',
            file: 'src/app/example.ts',
            type: 'class',

            // Basic properties that most templates would have
            methods: [
                {
                    name: 'ngOnInit',
                    type: 'void',
                    description: 'Lifecycle hook',
                    args: [],
                    returnType: 'void'
                }
            ],
            properties: [
                {
                    name: 'isActive',
                    type: 'boolean',
                    description: 'Active state',
                    defaultValue: 'false'
                }
            ]
        };
    }

    return { templateVariables, additionalContext };
}
