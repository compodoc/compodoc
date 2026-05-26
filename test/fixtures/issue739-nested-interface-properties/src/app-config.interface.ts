/**
 * Defines config JSON structure.
 */
export interface AppConfig {
    /**
     * Enable/disable console logging.
     */
    logging: boolean;

    /**
     * Different delays used in the app to improve UX.
     */
    delay: {
        /**
         * Delay between clicking on an option and going to next question.
         */
        questionAnsweredMs: number;

        /**
         * Delay between completing the feedback form and automatic restart.
         */
        restartAfterCompletedMs: number;

        /**
         * Delay before automatic form restart when user is inactive.
         */
        restartTimoutMs: number;
    };
}
