import { superString } from '../interfaces/interfaces';

import { Direction } from '../enums/enum';

/**
 * The todo class
 *
 * See {@link TodoStore} for service using it
 */
export class Todo {
    /**
     * Completed status
     */
    completed: boolean;
    /**
     * Editing status
     */
    editing: boolean;
}
