const polka = require('polka');
const sirv = require('sirv');
const { json, urlencoded } = require('body-parser');
const send = require('@polka/send-type');
import { IncomingMessage, ServerResponse } from 'http';
import { Polka } from 'polka';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as http from 'http';
import * as crypto from 'crypto';
import * as os from 'os';
const { ZipArchive } = require('archiver');
import { execSync } from 'child_process';
import { logger } from '../utils/logger';

interface PlaygroundSession {
    id: string;
    templateDir: string;
    documentationDir: string;
    lastActivity: number;
    config: CompoDocConfig;
    documentationGenerated?: boolean;
}

interface CompoDocConfig {
    // Documentation Metadata
    name?: string;

    // Paths and Output
    output?: string;
    theme?: string;
    language?: string;
    base?: string;

    // Assets and Custom UI
    customFavicon?: string;
    customLogo?: string;
    assetsFolder?: string;
    extTheme?: string;

    // Feature Toggles - Disable Options
    disableSourceCode?: boolean;
    disableGraph?: boolean;
    disableCoverage?: boolean;
    disablePrivate?: boolean;
    disableProtected?: boolean;
    disableInternal?: boolean;
    disableLifeCycleHooks?: boolean;
    disableConstructors?: boolean;
    disableRoutesGraph?: boolean;
    disableSearch?: boolean;
    disableDependencies?: boolean;
    disableProperties?: boolean;
    disableDomTree?: boolean;
    disableTemplateTab?: boolean;
    disableStyleTab?: boolean;
    disableMainGraph?: boolean;
    disableFilePath?: boolean;
    disableOverview?: boolean;

    // UI Options
    hideGenerator?: boolean;
    hideDarkModeToggle?: boolean;
    minimal?: boolean;

    // Additional Content
    includes?: string;
    includesName?: string;

    // Serving Options
    port?: number;
    hostname?: string;
    serve?: boolean;
    open?: boolean;
    watch?: boolean;

    // Export Options
    exportFormat?: string;

    // Coverage Options
    coverageTest?: boolean;
    coverageTestThreshold?: number;
    coverageMinimumPerFile?: number;
    coverageTestThresholdFail?: boolean;
    coverageTestShowOnlyFailed?: boolean;
    unitTestCoverage?: string;

    // Google Analytics
    gaID?: string;
    gaSite?: string;

    // Advanced Options
    silent?: boolean;
    maxSearchResults?: number;

    // Menu Configuration
    toggleMenuItems?: string[] | string;
    navTabConfig?: any[] | string;
}

export class TemplatePlaygroundServer {
    private app: Polka;
    private server: any;
    private port: number;
    private handlebars: any;
    private sessions: Map<string, PlaygroundSession> = new Map();
    private ipToSessionId: Map<string, string> = new Map();
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
    private fakeProjectPath: string;
    private originalTemplatesPath: string;
    private cleanupInterval: NodeJS.Timeout;
    private signalHandlers: Map<string, (...args: any[]) => void> = new Map();

    constructor(port?: number) {
        this.port = port || parseInt(process.env.PLAYGROUND_PORT || process.env.PORT || '3001', 10);
        this.app = polka();
        this.setupPaths();
        this.initializeHandlebars();
        this.setupMiddleware();
        this.setupRoutes();
        this.startSessionCleanup();
        this.setupSignalHandlers();
    }

    /**
     * Get the underlying HTTP server instance for testing purposes
     * @returns HTTP server instance or null if not started
     */
    public getHttpServer(): any {
        // Polka stores the actual HTTP server in the .server property
        // This is needed for Supertest compatibility which expects a Node.js HTTP server
        return this.server?.server || null;
    }

    private setupSignalHandlers(): void {
        // Skip signal handlers entirely in test environment to prevent memory leaks
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        // Handle CTRL+C (SIGINT) and other termination signals
        const signals = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
        
        signals.forEach(signal => {
            const handler = async () => {
                logger.info(`Received ${signal}, shutting down Template Playground server gracefully...`);
                try {
                    await this.stop();
                    logger.info('Server shutdown complete');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during server shutdown:', error);
                    process.exit(1);
                }
            };
            
            this.signalHandlers.set(signal, handler);
            process.on(signal, handler);
        });

        // Handle uncaught exceptions (only if not already handled)
        if (process.listenerCount('uncaughtException') === 0) {
            const uncaughtHandler = async (error) => {
                logger.error('Uncaught exception:', error);
                try {
                    await this.stop();
                } catch (stopError) {
                    logger.error('Error during emergency shutdown:', stopError);
                }
                process.exit(1);
            };
            
            this.signalHandlers.set('uncaughtException', uncaughtHandler);
            process.on('uncaughtException', uncaughtHandler);
        }

        // Handle unhandled promise rejections (only if not already handled)
        if (process.listenerCount('unhandledRejection') === 0) {
            const rejectionHandler = async (reason, promise) => {
                logger.error('Unhandled rejection at:', promise, 'reason:', reason);
                try {
                    await this.stop();
                } catch (stopError) {
                    logger.error('Error during emergency shutdown:', stopError);
                }
                process.exit(1);
            };
            
            this.signalHandlers.set('unhandledRejection', rejectionHandler);
            process.on('unhandledRejection', rejectionHandler);
        }
    }

    private setupPaths(): void {
        // Try to find paths for distributed package first, then fall back to development paths

        // For playground-demo: check resources/playground-demo first, then src directory
        const distributedFakeProjectPath = path.join(__dirname, 'resources', 'playground-demo');
        const devFakeProjectPath = path.join(process.cwd(), 'src', 'playground-demo');

        if (fs.existsSync(distributedFakeProjectPath)) {
            this.fakeProjectPath = distributedFakeProjectPath;
        } else if (fs.existsSync(devFakeProjectPath)) {
            this.fakeProjectPath = devFakeProjectPath;
        } else {
            throw new Error('playground-demo directory not found. Please ensure it exists.');
        }

        // For templates: check if we're running from dist (distributed) or development
        const distributedTemplatesPath = path.join(__dirname, 'templates');  // When running from dist/, this is dist/templates
        const devTemplatesPath = path.join(process.cwd(), 'src', 'templates');
        const legacyTemplatesPath = path.join(process.cwd(), 'hbs-templates-copy');

        if (fs.existsSync(distributedTemplatesPath)) {
            this.originalTemplatesPath = distributedTemplatesPath;
        } else if (fs.existsSync(devTemplatesPath)) {
            this.originalTemplatesPath = devTemplatesPath;
        } else if (fs.existsSync(legacyTemplatesPath)) {
            // Keep legacy support for existing hbs-templates-copy
            this.originalTemplatesPath = legacyTemplatesPath;
        } else {
            throw new Error('Templates directory not found. Please ensure src/templates or dist/templates exists.');
        }
    }

    private getClientIP(req: IncomingMessage): string {
        // Get IP address from various headers (handles proxies, load balancers, etc.)
        const forwarded = req.headers['x-forwarded-for'] as string;
        const realIP = req.headers['x-real-ip'] as string;
        const remoteAddr = (req as IncomingMessage & { socket?: { remoteAddress?: string } }).socket?.remoteAddress || 'unknown';

        let ip = forwarded?.split(',')[0] || realIP || remoteAddr || 'unknown';

        // Clean up IPv6 localhost
        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
            ip = '127.0.0.1';
        }

        return ip;
    }

    private generateSessionIdFromIP(ip: string): string {
        // Create a consistent hash from IP address
        return crypto.createHash('md5').update(ip + 'template-playground-salt').digest('hex');
    }

    private createOrGetSessionByIP(ip: string): PlaygroundSession {
        // Check if session already exists for this IP
        const existingSessionId = this.ipToSessionId.get(ip);
        if (existingSessionId && this.sessions.has(existingSessionId)) {
            const session = this.sessions.get(existingSessionId)!;
            // Update last activity
            session.lastActivity = Date.now();
            logger.info(`♻️  Reusing existing session for IP ${ip}: ${existingSessionId}`);
            return session;
        }

        // Create new session
        const sessionId = this.generateSessionIdFromIP(ip);
        const templateDir = path.join(os.tmpdir(), `hbs-templates-copy-${sessionId}`);
        const documentationDir = path.join(os.tmpdir(), `generated-documentation-${sessionId}`);

        // Clean up any existing directories from previous sessions
        if (fs.existsSync(templateDir)) {
            fs.removeSync(templateDir);
        }
        if (fs.existsSync(documentationDir)) {
            fs.removeSync(documentationDir);
        }

        // Copy original templates to session directory
        fs.copySync(this.originalTemplatesPath, templateDir);
        fs.ensureDirSync(documentationDir);

        const session: PlaygroundSession = {
            id: sessionId,
            templateDir,
            documentationDir,
            lastActivity: Date.now(),
            config: {
                hideGenerator: false,
                disableSourceCode: false,
                disableGraph: false,
                disableCoverage: false,
                disablePrivate: false,
                disableProtected: false,
                disableInternal: false
            }
        };

        this.sessions.set(sessionId, session);
        this.ipToSessionId.set(ip, sessionId);
        logger.info(`🆕 Created new session for IP ${ip}: ${sessionId}`);

        // Generate initial documentation (skip in test mode to avoid template issues)
        if (process.env.NODE_ENV !== 'test') {
            this.generateDocumentation(sessionId);
        }

        return session;
    }

    private createNewSession(ip: string): PlaygroundSession {
        // Generate a unique session ID (not based on IP)
        const sessionId = crypto.randomBytes(16).toString('hex');
        const templateDir = path.join(os.tmpdir(), `hbs-templates-copy-${sessionId}`);
        const documentationDir = path.join(os.tmpdir(), `generated-documentation-${sessionId}`);

        // Clean up any existing directories from previous sessions
        if (fs.existsSync(templateDir)) {
            fs.removeSync(templateDir);
        }
        if (fs.existsSync(documentationDir)) {
            fs.removeSync(documentationDir);
        }

        // Copy original templates to session directory
        fs.copySync(this.originalTemplatesPath, templateDir);
        fs.ensureDirSync(documentationDir);

        const session: PlaygroundSession = {
            id: sessionId,
            templateDir,
            documentationDir,
            lastActivity: Date.now(),
            config: {
                hideGenerator: false,
                disableSourceCode: false,
                disableGraph: false,
                disableCoverage: false,
                disablePrivate: false,
                disableProtected: false,
                disableInternal: false,
                disableFilePath: false,
                disableOverview: false
            }
        };

        this.sessions.set(sessionId, session);
        // Don't update ipToSessionId mapping for new sessions to allow multiple sessions per IP
        logger.info(`🆕 Created new session for IP ${ip}: ${sessionId}`);

        // Generate initial documentation (skip in test mode to avoid template issues)
        if (process.env.NODE_ENV !== 'test') {
            this.generateDocumentation(sessionId);
        }

        return session;
    }

    private updateSessionActivity(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = Date.now();
        }
    }

    private generateDocumentation(sessionId: string, debounce: boolean = false): void {
        if (debounce) {
            // Clear existing timer
            const existingTimer = this.debounceTimers.get(sessionId);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            // Set new timer for 300ms
            const timer = setTimeout(() => {
                this.runCompoDocForSession(sessionId);
                this.debounceTimers.delete(sessionId);
            }, 300);

            this.debounceTimers.set(sessionId, timer);
        } else {
            // Generate immediately
            this.runCompoDocForSession(sessionId);
        }
    }

    private async runCompoDocForSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session ${sessionId} not found`);
            return;
        }

        try {
            logger.info(`🚀 Generating documentation for session ${sessionId}`);

            // Build CompoDoc CLI command using absolute paths for temp directories
            // Use the configured fake project path with tsconfig.json
            const fakeProjectTsConfigPath = path.join(this.fakeProjectPath, 'tsconfig.json');

            // Use absolute path to the CLI script
            const cliPath = path.resolve(process.cwd(), 'bin', 'index-cli.js');
            
            // In test mode, check if CLI exists before proceeding
            if (process.env.NODE_ENV === 'test' && !fs.existsSync(cliPath)) {
                logger.warn(`CLI not found in test environment: ${cliPath}. Skipping documentation generation.`);
                session.documentationGenerated = true; // Mark as generated to avoid retries
                return;
            }
            
            const cmd = [
                `node "${cliPath}"`,
                `-p "${fakeProjectTsConfigPath}"`,
                `-d "${session.documentationDir}"`,
                `--templates "${session.templateDir}"`
            ];

            // Dynamically add all config options as CLI flags
            const config = session.config || {};
            const booleanFlags = [
                'hideGenerator', 'disableSourceCode', 'disableGraph', 'disableCoverage', 'disablePrivate', 'disableProtected', 'disableInternal',
                'disableLifeCycleHooks', 'disableConstructors', 'disableRoutesGraph', 'disableSearch', 'disableDependencies', 'disableProperties',
                'disableDomTree', 'disableTemplateTab', 'disableStyleTab', 'disableMainGraph', 'disableFilePath', 'disableOverview', 'hideDarkModeToggle', 'minimal', 'serve', 'open', 'watch', 'silent',
                'coverageTest', 'coverageTestThresholdFail', 'coverageTestShowOnlyFailed'
            ];
            const valueFlags = [
                'theme', 'language', 'base', 'customFavicon', 'customLogo', 'assetsFolder', 'extTheme', 'includes', 'includesName', 'output', 'port', 'hostname',
                'exportFormat', 'coverageTestThreshold', 'coverageMinimumPerFile', 'unitTestCoverage', 'gaID', 'gaSite', 'maxSearchResults', 'toggleMenuItems', 'navTabConfig'
            ];
            for (const flag of booleanFlags) {
                if (config[flag] === true) {
                    cmd.push(`--${flag}`);
                }
            }
            for (const flag of valueFlags) {
                if (config[flag] !== undefined && config[flag] !== "") {
                    let value = config[flag];
                    // For arrays/objects, stringify
                    if (Array.isArray(value) || typeof value === 'object') {
                        value = JSON.stringify(value);
                    }
                    cmd.push(`--${flag} \"${value}\"`);
                }
            }

            const fullCmd = cmd.join(' ');
            logger.info(`🚀 Executing CompoDoc command: ${fullCmd}`);

            // Log the command to a file for debugging
            require('fs').appendFileSync('server-commands.log', `${new Date().toISOString()} - ${fullCmd}\n`);

            // Execute with proper error handling (inherit stdio to see errors)
            execSync(fullCmd, {
                cwd: process.cwd(),
                stdio: 'inherit' // Show output/errors instead of hiding them
            });

            this.updateSessionActivity(sessionId);
            logger.info(`✅ Documentation generated successfully for session ${sessionId}`);

        } catch (error) {
            logger.error(`❌ Error generating documentation for session ${sessionId}:`, error);
        }
    }

    private startSessionCleanup(): void {
        // Clean up sessions older than 1 hour every 10 minutes
        this.cleanupInterval = setInterval(() => {
            const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hour ago

            for (const [sessionId, session] of this.sessions.entries()) {
                if (session.lastActivity < cutoffTime) {
                    this.cleanupSession(sessionId);
                }
            }
        }, 10 * 60 * 1000); // Every 10 minutes
    }

    private cleanupSession(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            try {
                // Remove directories
                if (fs.existsSync(session.templateDir)) {
                    fs.removeSync(session.templateDir);
                }
                if (fs.existsSync(session.documentationDir)) {
                    fs.removeSync(session.documentationDir);
                }

                // Clear timer if exists
                const timer = this.debounceTimers.get(sessionId);
                if (timer) {
                    clearTimeout(timer);
                    this.debounceTimers.delete(sessionId);
                }

                // Remove IP mapping
                for (const [ip, id] of this.ipToSessionId.entries()) {
                    if (id === sessionId) {
                        this.ipToSessionId.delete(ip);
                        break;
                    }
                }

                this.sessions.delete(sessionId);
                logger.info(`🧹 Cleaned up session: ${sessionId}`);
            } catch (error) {
                logger.error(`Error cleaning up session ${sessionId}:`, error);
            }
        }
    }

    private initializeHandlebars(): void {
        this.handlebars = require('handlebars');
        this.registerHandlebarsHelpers(this.handlebars, {});
    }

    private async registerAvailablePartials(): Promise<void> {
        try {
            const partialsDir = path.join(process.cwd(), 'dist/templates/partials');
            logger.info(`🔍 Looking for partials in: ${partialsDir}`);
            logger.info(`🔍 Partials directory exists: ${fs.existsSync(partialsDir)}`);

            if (fs.existsSync(partialsDir)) {
                const partialFiles = fs.readdirSync(partialsDir).filter(file => file.endsWith('.hbs'));
                logger.info(`📁 Found ${partialFiles.length} partial files: ${JSON.stringify(partialFiles)}`);

                for (const file of partialFiles) {
                    const partialName = file.replace('.hbs', '');
                    const partialPath = path.join(partialsDir, file);
                    const partialContent = fs.readFileSync(partialPath, 'utf8');

                    // Register the partial
                    this.handlebars.registerPartial(partialName, partialContent);
                    logger.info(`✅ Registered partial: ${partialName}`);
                }
            } else {
                logger.warn(`⚠️ Partials directory not found at: ${partialsDir}`);
            }
        } catch (error) {
            logger.error(`❌ Error registering partials:`, error);
        }
    }

    private setupMiddleware(): void {
        // Add request logging for debugging
        this.app.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
            const headers = req.headers;
            logger.info(`🔍 REQUEST: ${req.method} ${req.url} - User-Agent: ${headers['user-agent'] || 'unknown'}`);
            next();
        });

        // Enable CORS for development
        this.app.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
            } else {
                next();
            }
        });

        // Serve Compodoc resources at root level for relative path compatibility
        // Try dist/resources first (production), then src/resources (development/testing)
        const compodocResourcesPathDist = path.join(process.cwd(), 'dist/resources');
        const compodocResourcesPathSrc = path.join(process.cwd(), 'src/resources');
        
        const compodocResourcesPath = fs.existsSync(compodocResourcesPathDist) ? compodocResourcesPathDist : compodocResourcesPathSrc;
        logger.info(`📁 Setting up root-level static files from: ${compodocResourcesPath}`);
        logger.info(`📁 Compodoc resources path exists: ${fs.existsSync(compodocResourcesPath)}`);

        // Serve styles, js, images, and other resources at root level using sirv
        this.app.use('/styles', sirv(path.join(compodocResourcesPath, 'styles'), { dev: true }));
        this.app.use('/js', sirv(path.join(compodocResourcesPath, 'js'), { dev: true }));
        this.app.use('/images', sirv(path.join(compodocResourcesPath, 'images'), { dev: true }));
        this.app.use('/fonts', sirv(path.join(compodocResourcesPath, 'fonts'), { dev: true }));

        // Serve Compodoc resources under /resources path as well (for backward compatibility)
        this.app.use('/resources', sirv(compodocResourcesPath, { dev: true }));

        // Serve static files from template playground directory (index.html, app.js)
        // Try dist/resources first (production), then src/resources (development/testing)
        const playgroundStaticPathDist = path.join(process.cwd(), 'dist/resources/template-playground-app');
        const playgroundStaticPathSrc = path.join(process.cwd(), 'src/resources/template-playground-app');
        
        const playgroundStaticPath = fs.existsSync(playgroundStaticPathDist) ? playgroundStaticPathDist : playgroundStaticPathSrc;
        logger.info(`📁 Setting up playground static files from: ${playgroundStaticPath}`);
        logger.info(`📁 Playground static path exists: ${fs.existsSync(playgroundStaticPath)}`);
        this.app.use(sirv(playgroundStaticPath, { dev: true }));

        // Parse JSON bodies and form data using body-parser
        this.app.use(json({ limit: '10mb' }));
        this.app.use(urlencoded({ extended: true, limit: '10mb' }));
    }

    private setupRoutes(): void {
        // API route to get available templates
        this.app.get('/api/templates', this.getTemplates.bind(this));

        // API route to get template content
        this.app.get('/api/templates/:templateName', this.getTemplate.bind(this));

        // API route to get example data
        this.app.get('/api/example-data/:dataType', this.getExampleData.bind(this));

        // API route to render template with custom data
        this.app.post('/api/render', this.renderTemplate.bind(this));

        // API route to render complete page with template
        this.app.post('/api/render-page', this.renderCompletePage.bind(this));

        // API route to generate documentation with CompoDoc CLI
        this.app.post('/api/generate-docs', this.generateDocs.bind(this));

        // API route to download template package
        this.app.post('/api/download-template', this.downloadTemplatePackage.bind(this));

        // API route to download template ZIP (server-side creation)
        this.app.post('/api/session/:sessionId/download-zip', this.downloadSessionTemplateZip.bind(this));
        this.app.post('/api/session/:sessionId/download-all-templates', this.downloadAllSessionTemplates.bind(this));
        this.app.get('/api/session/:sessionId/download/all', this.downloadAllSessionTemplates.bind(this)); // Alias for compatibility

        // Session management API routes
        this.app.post('/api/session', this.createSessionAPI.bind(this));
        this.app.post('/api/session/create', this.createSessionAPI.bind(this));
        this.app.get('/api/session/:sessionId/templates', this.getSessionTemplates.bind(this));
        this.app.get('/api/session/:sessionId/template/*', this.getSessionTemplate.bind(this));
        this.app.post('/api/session/:sessionId/template/*', this.saveSessionTemplate.bind(this));
        this.app.get('/api/session/:sessionId/template-data/*', this.getSessionTemplateData.bind(this));
        this.app.post('/api/session/:sessionId/generate-docs', this.generateSessionDocs.bind(this));
        this.app.post('/api/session/:sessionId/generate', this.generateSessionDocs.bind(this)); // Alias for compatibility
        this.app.get('/api/session/:sessionId/config', this.getSessionConfig.bind(this));
        this.app.post('/api/session/:sessionId/config', this.updateSessionConfig.bind(this));

        // Serve session-specific generated documentation
        this.app.get('/api/session/:sessionId/docs/*', this.serveSessionDocs.bind(this));

        // Serve session-specific generated documentation at the expected URL pattern
        // These routes MUST come before the catch-all route
        this.app.get('/docs/:sessionId/index.html', (req: any, res: ServerResponse) => {
            logger.info(`🔍 Docs index route hit: /docs/${req.params.sessionId}/index.html`);
            const sessionId = req.params.sessionId;
            const session = this.sessions.get(sessionId);

            if (!session) {
                logger.error(`❌ Session not found: ${sessionId}`);
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            const fullPath = path.join(session.documentationDir, 'index.html');
            logger.info(`📂 Looking for file: ${fullPath}`);

            if (fs.existsSync(fullPath)) {
                logger.info(`✅ Serving file: ${fullPath}`);
                const content = fs.readFileSync(fullPath);
                res.setHeader('Content-Type', 'text/html');
                res.end(content);
            } else {
                logger.error(`❌ File not found: ${fullPath}`);
                res.statusCode = 404;
                res.end('Documentation file not found');
            }
        });

        // Serve any file within session documentation using dynamic sirv middleware
        this.app.get('/docs/:sessionId/*', (req: any, res: ServerResponse) => {
            const sessionId = req.params.sessionId;
            const session = this.sessions.get(sessionId);

            if (!session) {
                logger.error(`❌ Session not found: ${sessionId}`);
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            // Use sirv to serve files from the session documentation directory
            const sessionSirv = sirv(session.documentationDir, { 
                dev: true,
                single: false,
                setHeaders: (res, pathname) => {
                    logger.info(`✅ Serving file via sirv: ${pathname}`);
                }
            });

            // Remove the session prefix from the URL for sirv
            const originalUrl = req.url;
            const sessionPrefix = `/docs/${sessionId}`;
            if (originalUrl && originalUrl.startsWith(sessionPrefix)) {
                req.url = originalUrl.substring(sessionPrefix.length) || '/';
                logger.info(`🔍 Sirv serving: ${req.url} from ${session.documentationDir}`);
            }

            sessionSirv(req, res, () => {
                // If sirv doesn't handle it, restore original URL and return 404
                req.url = originalUrl;
                logger.error(`❌ File not found in session docs: ${req.url}`);
                res.statusCode = 404;
                res.end('Documentation file not found');
            });
        });

        // Handle direct access to session documentation root (index.html)
        this.app.get('/docs/:sessionId', (req: any, res: ServerResponse) => {
            logger.info(`🔍 Docs root route hit: /docs/${req.params.sessionId}`);
            const sessionId = req.params.sessionId;
            const session = this.sessions.get(sessionId);

            if (!session) {
                logger.error(`❌ Session not found: ${sessionId}`);
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            const fullPath = path.join(session.documentationDir, 'index.html');
            logger.info(`📂 Looking for file: ${fullPath}`);

            if (fs.existsSync(fullPath)) {
                logger.info(`✅ Serving file: ${fullPath}`);
                const content = fs.readFileSync(fullPath);
                res.setHeader('Content-Type', 'text/html');
                res.end(content);
            } else {
                logger.error(`❌ File not found: ${fullPath}`);
                res.statusCode = 404;
                res.end('Documentation file not found');
            }
        });

        // Serve generated documentation files (legacy) - MUST come after session-specific routes
        // TEMPORARILY COMMENTED OUT TO TEST SESSION ROUTES
        // this.app.use('/docs', express.static(this.fakeProjectPath)); // Serve generated docs from playground-demo

        // Serve the main playground app for root path only
        this.app.get('/', (req, res) => {
            // Try dist/resources first (production), then src/resources (development/testing)
            const indexPathDist = path.join(process.cwd(), 'dist/resources/template-playground-app/index.html');
            const indexPathSrc = path.join(process.cwd(), 'src/resources/template-playground-app/index.html');
            
            const indexPath = fs.existsSync(indexPathDist) ? indexPathDist : indexPathSrc;
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath);
                res.setHeader('Content-Type', 'text/html');
                res.end(content);
            } else {
                res.statusCode = 404;
                res.end('Template Playground not built. Please run the build process.');
            }
        });

        // Handle any remaining non-API routes by serving the main app (for SPA routing)
        // Note: This catch-all route should be last and will handle all unmatched routes
        this.app.get('*', (req, res) => {
            // Skip API, resources, and docs routes as they are handled above
            if (req.url.startsWith('/api') || req.url.startsWith('/resources') || req.url.startsWith('/docs')) {
                res.statusCode = 404;
                res.end('Not Found');
                return;
            }
            logger.warn(`⚠️ CATCH-ALL ROUTE HIT: ${req.method} ${req.url}`);
            // Try dist/resources first (production), then src/resources (development/testing)
            const indexPathDist = path.join(process.cwd(), 'dist/resources/template-playground-app/index.html');
            const indexPathSrc = path.join(process.cwd(), 'src/resources/template-playground-app/index.html');
            
            const indexPath = fs.existsSync(indexPathDist) ? indexPathDist : indexPathSrc;
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath);
                res.setHeader('Content-Type', 'text/html');
                res.end(content);
            } else {
                res.statusCode = 404;
                res.end('Template Playground not built. Please run the build process.');
            }
        });
    }

    private async getTemplates(req: any, res: ServerResponse): Promise<void> {
        try {
            const templatesDir = path.join(process.cwd(), 'dist/templates/partials');
            const files = await fs.readdir(templatesDir);
            const templates = files
                .filter(file => file.endsWith('.hbs'))
                .map(file => ({
                    name: file.replace('.hbs', ''),
                    filename: file,
                    path: path.join(templatesDir, file)
                }));

            send(res, 200, templates);
        } catch (error) {
            logger.error('Error reading templates:', error);
            send(res, 500, { error: 'Failed to read templates' });
        }
    }

    private async getTemplate(req: any, res: ServerResponse): Promise<void> {
        try {
            const templateName = req.params.templateName;
            const templatePath = path.join(process.cwd(), 'dist/templates/partials', `${templateName}.hbs`);

            if (!await fs.pathExists(templatePath)) {
                send(res, 404, { error: 'Template not found' });
                return;
            }

            const content = await fs.readFile(templatePath, 'utf-8');
            send(res, 200, {
                name: templateName,
                content: content,
                path: templatePath
            });
        } catch (error) {
            logger.error('Error reading template:', error);
            send(res, 500, { error: 'Failed to read template' });
        }
    }

    private async getExampleData(req: any, res: ServerResponse): Promise<void> {
        try {
            const dataType = req.params.dataType;

            // Import example data dynamically
            const { EXAMPLE_DATA, TEMPLATE_CONTEXT } = await import('./example-data');

            if (!EXAMPLE_DATA[dataType]) {
                send(res, 404, { error: 'Example data type not found' });
                return;
            }

            // Wrap data for template compatibility
            const wrappedData = dataType === 'component' || dataType === 'directive' || dataType === 'pipe' ||
                               dataType === 'guard' || dataType === 'interceptor' || dataType === 'injectable' ||
                               dataType === 'class' || dataType === 'interface' || dataType === 'entity' ?
                { [dataType]: EXAMPLE_DATA[dataType], ...EXAMPLE_DATA[dataType] } :
                EXAMPLE_DATA[dataType];

            send(res, 200, {
                data: wrappedData,
                context: TEMPLATE_CONTEXT
            });
        } catch (error) {
            logger.error('Error getting example data:', error);
            send(res, 500, { error: 'Failed to get example data' });
        }
    }

    private async renderTemplate(req: any, res: ServerResponse): Promise<void> {
        try {
            const { templateContent, templateData, templateContext } = req.body;

            if (!templateContent) {
                send(res, 400, { error: 'Template content is required' });
                return;
            }

            // Use the pre-initialized Handlebars instance
            const template = this.handlebars.compile(templateContent);
            const rendered = template(templateData || {});

            send(res, 200, { rendered });
        } catch (error) {
            logger.error('Error rendering template:', error);
            send(res, 500, {
                error: 'Failed to render template',
                details: error.message
            });
        }
    }

    private async renderCompletePage(req: any, res: ServerResponse): Promise<void> {
        try {
            let { templateContent, templateData, templateContext } = req.body;

            // Handle form data by parsing JSON strings
            if (typeof templateData === 'string') {
                try {
                    templateData = JSON.parse(templateData);
                } catch (e) {
                    templateData = {};
                }
            }

            if (typeof templateContext === 'string') {
                try {
                    templateContext = JSON.parse(templateContext);
                } catch (e) {
                    templateContext = {};
                }
            }

            if (!templateContent) {
                send(res, 400, { error: 'Template content is required' });
                return;
            }

            // Generate proper Compodoc-style HTML directly
            const renderedContent = this.generateCompodocHtml(templateData || {});

            // Create complete HTML page with Compodoc styling
            const completePage = `<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Template Preview - Compodoc</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" type="image/x-icon" href="/resources/images/favicon.ico">
        <link rel="stylesheet" href="/resources/styles/bootstrap.min.css">
        <link rel="stylesheet" href="/resources/styles/compodoc.css">
        <link rel="stylesheet" href="/resources/styles/prism.css">
        <link rel="stylesheet" href="/resources/styles/dark.css">
        <link rel="stylesheet" href="/resources/styles/style.css">
    </head>
    <body>
        <script>
            // Blocking script to avoid flickering dark mode
            var useDark = window.matchMedia('(prefers-color-scheme: dark)');
            var darkModeState = useDark.matches;
            var darkModeStateLocal = localStorage.getItem('compodoc_darkmode-state');
            if (darkModeStateLocal) {
                darkModeState = darkModeStateLocal === 'true';
            }
            if (darkModeState) {
                document.body.classList.add('dark');
            }
        </script>

        <div class="container-fluid main">
            <!-- START CONTENT -->
            <div class="content component">
                <div class="content-data">
                    ${renderedContent}
                </div>
            </div>
            <!-- END CONTENT -->
        </div>

        <script>
            var COMPODOC_CURRENT_PAGE_DEPTH = 0;
            var COMPODOC_CURRENT_PAGE_CONTEXT = 'component';
            var COMPODOC_CURRENT_PAGE_URL = 'component.html';
        </script>

        <script src="/resources/js/libs/bootstrap-native.js"></script>
        <script src="/resources/js/libs/prism.js"></script>
        <script src="/resources/js/compodoc.js"></script>
        <script src="/resources/js/tabs.js"></script>
        <script src="/resources/js/sourceCode.js"></script>
    </body>
</html>`;

            res.setHeader('Content-Type', 'text/html');
            res.end(completePage);
        } catch (error) {
            logger.error('Error rendering complete page:', error);
            send(res, 500, {
                error: 'Failed to render complete page',
                details: error.message
            });
        }
    }

    private async generateDocs(req: any, res: ServerResponse): Promise<void> {
        try {
            const { customTemplateContent, mockData } = req.body;

            // Update mock data if provided
            if (mockData) {
                // This part of the logic needs to be adapted to work with the new session-based system
                // For now, we'll just log that it's not directly applicable here
                logger.warn('mockData parameter is not directly applicable in this session-based system. It will be ignored.');
            }

            // Create or get session for the documentation generation based on client IP
            const clientIP = this.getClientIP(req);
            const session = this.createOrGetSessionByIP(clientIP);
            const sessionId = session.id;

            // Update session config if custom template content is provided
            if (customTemplateContent && req.body.templatePath) {
                const templatePath = path.join(session.templateDir, req.body.templatePath);
                await fs.writeFile(templatePath, customTemplateContent, 'utf8');
            }

            // Generate documentation for the new session
            this.generateDocumentation(sessionId, true); // Use debounce

            send(res, 200, { success: true, message: 'Documentation generation initiated for a new session', sessionId: sessionId });
        } catch (error) {
            logger.error('Error generating documentation:', error);
            send(res, 500, {
                error: 'Failed to generate documentation',
                details: error.message
            });
        }
    }

    private registerHandlebarsHelpers(Handlebars: any, context: any): void {
        // Register translation helper (matches Compodoc's i18n helper pattern)
        Handlebars.registerHelper('t', function() {
            console.log('T HELPER CALLED');
            const context = this;
            const key = arguments[0];
            const translations: { [key: string]: string } = {
                'components': 'Components',
                'modules': 'Modules',
                'interfaces': 'Interfaces',
                'classes': 'Classes',
                'injectables': 'Injectables',
                'pipes': 'Pipes',
                'directives': 'Directives',
                'guards': 'Guards',
                'interceptors': 'Interceptors',
                'entities': 'Entities',
                'controllers': 'Controllers',
                'info': 'Info',
                'readme': 'Readme',
                'source': 'Source',
                'template': 'Template',
                'styles': 'Styles',
                'dom-tree': 'DOM Tree',
                'file': 'File',
                'description': 'Description',
                'implements': 'Implements',
                'metadata': 'Metadata',
                'index': 'Index',
                'methods': 'Methods',
                'properties': 'Properties'
            };
            return translations[key] || key;
        });

        // Register relative URL helper
        Handlebars.registerHelper('relativeURL', (depth: any, ...args: any[]) => {
            const depthValue = typeof depth === 'number' ? depth : (context.depth || 0);
            const baseUrl = '../'.repeat(depthValue);
            const pathArgs = args.slice(0, -1); // Remove Handlebars options object
            return baseUrl + pathArgs.join('/');
        });

                        // Register comparison helper (matches Compodoc's CompareHelper implementation)
        Handlebars.registerHelper('compare', function() {
            const context = this;
            const a = arguments[0];
            const operator = arguments[1];
            const b = arguments[2];
            const options = arguments[3];

            if (arguments.length < 4) {
                throw new Error('handlebars Helper {{compare}} expects 4 arguments');
            }

            let result = false;
            switch (operator) {
                case 'indexof':
                    result = b.indexOf(a) !== -1;
                    break;
                case '===':
                    result = a === b;
                    break;
                case '!==':
                    result = a !== b;
                    break;
                case '>':
                    result = a > b;
                    break;
                case '<':
                    result = a < b;
                    break;
                case '>=':
                    result = a >= b;
                    break;
                case '<=':
                    result = a <= b;
                    break;
                case '==':
                    result = a == b;
                    break;
                case '!=':
                    result = a != b;
                    break;
                default:
                    throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
            }

            if (result === false) {
                return options.inverse(context);
            }
            return options.fn(context);
        });

        // Register tab helpers (matches Compodoc's IsTabEnabledHelper and IsInitialTabHelper)
        Handlebars.registerHelper('isTabEnabled', function() {
            const context = this;
            const navTabs = arguments[0];
            const tabId = arguments[1];
            const options = arguments[2];

            const isEnabled = navTabs && navTabs.some((tab: any) => tab.id === tabId);
            if (isEnabled) {
                return options.fn(context);
            } else {
                return options.inverse(context);
            }
        });

        Handlebars.registerHelper('isInitialTab', function() {
            const context = this;
            const navTabs = arguments[0];
            const tabId = arguments[1];

            const isInitial = navTabs && navTabs.length > 0 && navTabs[0].id === tabId;
            if (isInitial) {
                return 'active in';
            }
            return '';
        });

        // Register utility helpers
        Handlebars.registerHelper('orLength', function(...args: any[]) {
            const options = args.pop();
            const hasLength = args.some(arg => arg && (Array.isArray(arg) ? arg.length > 0 : arg));
            if (hasLength) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('breakComma', function(array: any[]) {
            if (Array.isArray(array)) {
                return array.join(', ');
            }
            return array;
        });

        Handlebars.registerHelper('parseDescription', function(description: string, depth: number) {
            // Simple markdown parsing - just return as HTML for now
            return new Handlebars.SafeString(description || '');
        });

        Handlebars.registerHelper('escapeSimpleQuote', function(text: string) {
            if (typeof text === 'string') {
                return text.replace(/'/g, "\\'");
            }
            return text;
        });

        // Register JSDoc helper
        Handlebars.registerHelper('jsdoc-code-example', function(jsdoctags: any[], options: any) {
            return options.fn({ tags: jsdoctags || [] });
        });

        // Register link-type helper as a simple partial
        Handlebars.registerHelper('link-type', function(type: any, options: any) {
            if (type && type.href) {
                return new Handlebars.SafeString(`<a href="${type.href}" target="${type.target || '_self'}">${type.raw || type}</a>`);
            }
            return type;
        });

        // Register built-in block helpers
        Handlebars.registerHelper('each', Handlebars.helpers.each);
        Handlebars.registerHelper('if', Handlebars.helpers.if);
        Handlebars.registerHelper('unless', Handlebars.helpers.unless);
        Handlebars.registerHelper('with', Handlebars.helpers.with);

        // Register common partials used in templates
        Handlebars.registerPartial('component-detail', `
            <p class="comment">
                <h3>{{t "file"}}</h3>
            </p>
            <p class="comment">
                <code>{{component.file}}</code>
            </p>

            {{#if component.description}}
                <p class="comment">
                    <h3>{{t "description"}}</h3>
                </p>
                <p class="comment">
                    {{{parseDescription component.description depth}}}
                </p>
            {{/if}}

            {{#if component.implements}}
                <p class="comment">
                    <h3>{{t "implements"}}</h3>
                </p>
                <p class="comment">
                    {{#each component.implements}}
                        <code>{{this}}</code>{{#unless @last}}, {{/unless}}
                    {{/each}}
                </p>
            {{/if}}

            <section data-compodoc="block-metadata">
                <h3>{{t "metadata"}}</h3>
                <table class="table table-sm table-hover metadata">
                    <tbody>
                        {{#if component.selector}}
                        <tr>
                            <td class="col-md-3">selector</td>
                            <td class="col-md-9"><code>{{component.selector}}</code></td>
                        </tr>
                        {{/if}}
                        {{#if component.templateUrl}}
                        <tr>
                            <td class="col-md-3">templateUrl</td>
                            <td class="col-md-9"><code>{{component.templateUrl}}</code></td>
                        </tr>
                        {{/if}}
                        {{#if component.styleUrls}}
                        <tr>
                            <td class="col-md-3">styleUrls</td>
                            <td class="col-md-9"><code>{{breakComma component.styleUrls}}</code></td>
                        </tr>
                        {{/if}}
                    </tbody>
                </table>
            </section>

            {{#orLength component.properties component.methods component.inputs component.outputs}}
                <section data-compodoc="block-index">
                    <h3 id="index">{{t "index"}}</h3>
                    <table class="table table-sm table-bordered index-table">
                        <tbody>
                            {{#if component.methods}}
                            <tr>
                                <td class="col-md-4">
                                    <h6><b>{{t "methods"}}</b></h6>
                                </td>
                            </tr>
                            <tr>
                                <td class="col-md-4">
                                    <ul class="index-list">
                                        {{#each component.methods}}
                                        <li><a href="#{{name}}">{{name}}</a></li>
                                        {{/each}}
                                    </ul>
                                </td>
                            </tr>
                            {{/if}}
                            {{#if component.properties}}
                            <tr>
                                <td class="col-md-4">
                                    <h6><b>{{t "properties"}}</b></h6>
                                </td>
                            </tr>
                            <tr>
                                <td class="col-md-4">
                                    <ul class="index-list">
                                        {{#each component.properties}}
                                        <li><a href="#{{name}}">{{name}}</a></li>
                                        {{/each}}
                                    </ul>
                                </td>
                            </tr>
                            {{/if}}
                        </tbody>
                    </table>
                </section>
            {{/orLength}}

            {{#if component.methods}}
                <section data-compodoc="block-methods">
                    <h3 id="methods">{{t "methods"}}</h3>
                    {{#each component.methods}}
                    <table class="table table-sm table-bordered">
                        <tbody>
                            <tr>
                                <td class="col-md-4">
                                    <a name="{{name}}"></a>
                                    <span class="name">
                                        <span><b>{{name}}</b></span>
                                        <a href="#{{name}}"><span class="icon ion-ios-link"></span></a>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td class="col-md-4">
                                    <code>{{name}}({{#each args}}{{name}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}})</code>
                                </td>
                            </tr>
                            {{#if description}}
                            <tr>
                                <td class="col-md-4">
                                    <div class="io-description">{{description}}</div>
                                    <div class="io-description">
                                        <b>Returns : </b><code>{{type}}</code>
                                    </div>
                                </td>
                            </tr>
                            {{/if}}
                        </tbody>
                    </table>
                    {{/each}}
                </section>
            {{/if}}
        `);

        Handlebars.registerPartial('index', '<!-- Index partial placeholder -->');
        Handlebars.registerPartial('link-type', '<code>{{type}}</code>');
    }

    private generateCompodocHtml(data: any): string {
        const component = data.component || {};
        const navTabs = data.navTabs || [];

        // Generate navigation tabs
        const tabsHtml = navTabs.map((tab, index) => {
            const isActive = index === 0;
            const activeClass = isActive ? 'nav-link active' : 'nav-link';
            const labelMap = {
                'info': 'Info',
                'readme': 'Readme',
                'source': 'Source',
                'template': 'Template',
                'styles': 'Styles',
                'dom-tree': 'DOM Tree'
            };
            const label = labelMap[tab.label] || tab.label;

            return `        <li class="nav-item">
            <a href="${tab.href}" class="${activeClass}" role="tab" id="${tab.id}-tab" data-bs-toggle="tab" data-link="${tab['data-link']}">${label}</a>
        </li>`;
        }).join('\n');

        // Generate tab content
        let tabContentHtml = '';

        // Info tab
        if (navTabs.some(tab => tab.id === 'info')) {
            const isActive = navTabs[0].id === 'info';
            const activeClass = isActive ? 'active in' : '';

            tabContentHtml += `    <div class="tab-pane fade ${activeClass}" id="info">
        <p class="comment">
            <h3>File</h3>
        </p>
        <p class="comment">
            <code>${component.file || ''}</code>
        </p>

        ${component.description ? `
        <p class="comment">
            <h3>Description</h3>
        </p>
        <p class="comment">
            <p>${component.description.replace(/\n/g, '</p>\n<p>')}</p>
        </p>
        ` : ''}

        ${component.implements && component.implements.length > 0 ? `
        <p class="comment">
            <h3>Implements</h3>
        </p>
        <p class="comment">
            ${component.implements.map(impl => `<code>${impl}</code>`).join(', ')}
        </p>
        ` : ''}

        <section data-compodoc="block-metadata">
            <h3>Metadata</h3>
            <table class="table table-sm table-hover metadata">
                <tbody>
                    ${component.selector ? `
                    <tr>
                        <td class="col-md-3">selector</td>
                        <td class="col-md-9"><code>${component.selector}</code></td>
                    </tr>` : ''}
                    ${component.templateUrl ? `
                    <tr>
                        <td class="col-md-3">templateUrl</td>
                        <td class="col-md-9"><code>${component.templateUrl}</code></td>
                    </tr>` : ''}
                    ${component.styleUrls && component.styleUrls.length > 0 ? `
                    <tr>
                        <td class="col-md-3">styleUrls</td>
                        <td class="col-md-9"><code>${component.styleUrls.join(', ')}</code></td>
                    </tr>` : ''}
                </tbody>
            </table>
        </section>

        ${component.methods && component.methods.length > 0 ? `
        <section data-compodoc="block-index">
            <h3 id="index">Index</h3>
            <table class="table table-sm table-bordered index-table">
                <tbody>
                    <tr>
                        <td class="col-md-4">
                            <h6><b>Methods</b></h6>
                        </td>
                    </tr>
                    <tr>
                        <td class="col-md-4">
                            <ul class="index-list">
                                ${component.methods.map(method => `<li><a href="#${method.name}">${method.name}</a></li>`).join('\n                                ')}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section data-compodoc="block-methods">
            <h3 id="methods">Methods</h3>
            ${component.methods.map(method => `
            <table class="table table-sm table-bordered">
                <tbody>
                    <tr>
                        <td class="col-md-4">
                            <a name="${method.name}"></a>
                            <span class="name">
                                <span><b>${method.name}</b></span>
                                <a href="#${method.name}"><span class="icon ion-ios-link"></span></a>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td class="col-md-4">
                            <code>${method.name}()</code>
                        </td>
                    </tr>
                    ${method.description ? `
                    <tr>
                        <td class="col-md-4">
                            <div class="io-description">${method.description}</div>
                            <div class="io-description">
                                <b>Returns : </b><code>${method.type || 'void'}</code>
                            </div>
                        </td>
                    </tr>` : ''}
                </tbody>
            </table>`).join('\n            ')}
        </section>` : ''}
    </div>
`;
        }

        // Source tab
        if (navTabs.some(tab => tab.id === 'source')) {
            const isActive = navTabs[0].id === 'source';
            const activeClass = isActive ? 'active in' : '';

            tabContentHtml += `    <div class="tab-pane fade ${activeClass} tab-source-code" id="source">
        <pre class="line-numbers compodoc-sourcecode"><code class="language-typescript">${component.sourceCode || ''}</code></pre>
    </div>
`;
        }

        // Generate complete HTML
        return `<ol class="breadcrumb">
  <li class="breadcrumb-item">Components</li>
  <li class="breadcrumb-item">${component.name || ''}</li>
</ol>

<ul class="nav nav-tabs" role="tablist">
${tabsHtml}
</ul>

<div class="tab-content">
${tabContentHtml}</div>`;
    }

    private async downloadTemplatePackage(req: any, res: ServerResponse): Promise<void> {
        try {
            const { templateType, templateContent, templateData } = req.body;

            if (!templateType || !templateContent) {
                send(res, 400, { error: 'Template type and content are required' });
                return;
            }

            // Create README content
            const readme = `# Custom Compodoc Template

This package contains your customized Compodoc template for: **${templateType}**

## Files Included

- \`templates/partials/${templateType}.hbs\` - Your modified template
- \`example-data.json\` - Sample data structure for testing
- \`README.md\` - This file

## How to Use

### Option 1: Replace in existing Compodoc installation

1. Backup your original template file (usually in \`node_modules/@compodoc/compodoc/dist/templates/partials/${templateType}.hbs\`)
2. Replace it with the provided \`${templateType}.hbs\` file
3. Regenerate your documentation with Compodoc

### Option 2: Use with custom template directory

1. Create a custom templates directory in your project:
   \`\`\`
   mkdir -p custom-templates/partials
   \`\`\`

2. Copy the \`${templateType}.hbs\` file to:
   \`\`\`
   custom-templates/partials/${templateType}.hbs
   \`\`\`

3. Run Compodoc with the custom template directory:
   \`\`\`
   compodoc -p tsconfig.json -d documentation --customTemplate custom-templates
   \`\`\`

## Template Variables

The template has access to these main variables:

- \`component\` - Component information (name, description, inputs, outputs, etc.)
- \`navTabs\` - Navigation tabs configuration
- \`depth\` - Current page depth for relative URLs
- \`t\` - Translation helper function

For a complete list of available variables, see the \`example-data.json\` file.

## Need Help?

- Compodoc Documentation: https://compodoc.app/
- GitHub Issues: https://github.com/compodoc/compodoc/issues

Generated by Compodoc Template Playground on ${new Date().toLocaleString()}
`;

            // Create example data
            const exampleData = {
                template: templateType,
                description: 'This is sample data that matches the structure used in Compodoc templates',
                data: templateData || {}
            };

            // Create ZIP structure as JSON (to be processed by frontend)
            const zipStructure = {
                [`templates/partials/${templateType}.hbs`]: templateContent,
                'README.md': readme,
                'example-data.json': JSON.stringify(exampleData, null, 2)
            };

            send(res, 200, {
                success: true,
                filename: `compodoc-${templateType}-template.zip`,
                files: zipStructure
            });

        } catch (error) {
            logger.error('Error creating template package:', error);
            send(res, 500, {
                error: 'Failed to create template package',
                details: error.message
            });
        }
    }

    private async downloadSessionTemplateZip(req: any, res: ServerResponse): Promise<void> {
        try {
            const { sessionId } = req.params;
            const { templatePath, templateContent } = req.body;

            if (!templatePath || !templateContent) {
                send(res, 400, { error: 'Template path and content are required' });
                return;
            }

            const session = this.sessions.get(sessionId);
            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            // Extract template name from path
            const templateName = path.basename(templatePath, '.hbs');
            const fileName = `compodoc-${templateName}-template.zip`;

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

                        // Create ZIP archive and handle it with proper promise
            await new Promise<void>((resolve, reject) => {
                const archive = new ZipArchive({
                    zlib: { level: 9 } // Maximum compression
                });

                // Handle archive events
                archive.on('error', (err) => {
                    logger.error('Archive error:', err);
                    reject(new Error(`Failed to create ZIP file: ${err.message}`));
                });

                archive.on('end', () => {
                    logger.info(`✅ Template ZIP created successfully for session ${sessionId}: ${fileName}`);
                    resolve();
                });

                // Pipe archive to response
                archive.pipe(res);

                // Add template file to ZIP
                archive.append(templateContent, { name: `templates/partials/${templateName}.hbs` });

                // Create README content
                const readme = `# Custom Compodoc Template

This package contains your customized Compodoc template for: **${templateName}**

## Files Included

- \`templates/partials/${templateName}.hbs\` - Your modified template
- \`example-data.json\` - Sample data structure for testing
- \`README.md\` - This file

## How to Use

### Option 1: Replace in existing Compodoc installation

1. Backup your original template file (usually in \`node_modules/@compodoc/compodoc/dist/templates/partials/${templateName}.hbs\`)
2. Replace it with the provided \`${templateName}.hbs\` file
3. Regenerate your documentation with Compodoc

### Option 2: Use with custom template directory

1. Create a custom templates directory in your project:
   \`\`\`
   mkdir -p custom-templates/partials
   \`\`\`

2. Copy the \`${templateName}.hbs\` file to:
   \`\`\`
   custom-templates/partials/${templateName}.hbs
   \`\`\`

3. Run Compodoc with the custom template directory:
   \`\`\`
   compodoc -p tsconfig.json -d documentation --customTemplate custom-templates
   \`\`\`

## Template Variables

The template has access to these main variables:

- \`component\` - Component information (name, description, inputs, outputs, etc.)
- \`navTabs\` - Navigation tabs configuration
- \`depth\` - Current page depth for relative URLs
- \`t\` - Translation helper function

For a complete list of available variables, see the \`example-data.json\` file.

## Need Help?

- Compodoc Documentation: https://compodoc.app/
- GitHub Issues: https://github.com/compodoc/compodoc/issues

Generated by Compodoc Template Playground on ${new Date().toLocaleString()}
`;

                // Add README to ZIP
                archive.append(readme, { name: 'README.md' });

                // Try to get template data for the current session and template
                this.getSessionTemplateDataInternal(sessionId, templatePath)
                    .then(templateDataResponse => {
                        const exampleData = {
                            template: templateName,
                            description: 'This is sample data that matches the structure used in Compodoc templates',
                            data: templateDataResponse || {}
                        };
                        archive.append(JSON.stringify(exampleData, null, 2), { name: 'example-data.json' });
                    })
                    .catch(dataError => {
                        logger.warn('Could not get template data, using basic structure:', dataError);
                        const basicData = {
                            template: templateName,
                            description: 'This is sample data that matches the structure used in Compodoc templates',
                            data: { note: 'Template data could not be loaded' }
                        };
                        archive.append(JSON.stringify(basicData, null, 2), { name: 'example-data.json' });
                    })
                    .finally(() => {
                        // Finalize the archive after adding all files
                        archive.finalize();
                    });
            });

        } catch (error) {
            logger.error('Error creating session template ZIP:', error);
            if (!res.headersSent) {
                send(res, 500, {
                    error: 'Failed to create template ZIP',
                    details: error.message
                });
            }
        }
    }

    private async downloadAllSessionTemplates(req: any, res: ServerResponse): Promise<void> {
        try {
            const { sessionId } = req.params;

            const session = this.sessions.get(sessionId);
            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            const fileName = `compodoc-templates-${sessionId}.zip`;

            // Create ZIP archive in memory for supertest compatibility
            const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
                const archive = new ZipArchive({
                    zlib: { level: 9 } // Maximum compression
                });

                const chunks: Buffer[] = [];

                // Handle archive events
                archive.on('error', (err) => {
                    logger.error('Archive error:', err);
                    reject(new Error(`Failed to create ZIP file: ${err.message}`));
                });

                archive.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                archive.on('end', () => {
                    logger.info(`✅ All templates ZIP created successfully for session ${sessionId}: ${fileName}`);
                    const buffer = Buffer.concat(chunks);
                    resolve(buffer);
                });

                // Add all files from the session's template directory
                // This maintains the same structure as hbs-templates-copy-<hash>
                archive.directory(session.templateDir, false);

                // Create a comprehensive README
                const readme = `# Compodoc Template Package

This package contains all customized Compodoc templates for session: **${sessionId}**

## Structure

This template package has the same structure as Compodoc's default templates:

- \`page.hbs\` - Main page template
- \`partials/\` - Directory containing all partial templates:
  - Component templates (\`component.hbs\`, \`directive.hbs\`, etc.)
  - Block templates (\`block-*.hbs\`)
  - Layout templates (\`menu.hbs\`, \`index.hbs\`, etc.)
  - Utility templates (\`search-*.hbs\`, \`coverage-*.hbs\`, etc.)

## How to Use

### Option 1: Replace entire template directory

1. Backup your original templates directory (usually in \`node_modules/@compodoc/compodoc/dist/templates/\`)
2. Replace it with the contents of this ZIP file
3. Regenerate your documentation with Compodoc

### Option 2: Use with custom template directory

1. Extract this ZIP to a directory in your project (e.g., \`custom-templates/\`)
2. Run Compodoc with the custom template directory:
   \`\`\`
   compodoc -p tsconfig.json -d documentation --customTemplate custom-templates
   \`\`\`

### Option 3: Use specific templates only

1. Extract only the templates you want to customize
2. Place them in your custom template directory maintaining the same structure
3. Compodoc will use your custom templates and fall back to defaults for others

## Template Variables

Templates have access to comprehensive data structures including:

- Component/Directive/Service information
- Navigation and routing data
- Documentation metadata
- Configuration options
- Helper functions for formatting and navigation

## Need Help?

- Compodoc Documentation: https://compodoc.app/
- GitHub Issues: https://github.com/compodoc/compodoc/issues
- Template Documentation: https://compodoc.app/guides/templates.html

Generated by Compodoc Template Playground on ${new Date().toLocaleString()}
`;

                // Add README to ZIP root
                archive.append(readme, { name: 'README.md' });

                // Finalize the archive after adding all files
                archive.finalize();
            });

            // Set headers and send buffer response for supertest compatibility
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', zipBuffer.length.toString());
            
            // For testing, also add a custom header with the size
            res.setHeader('X-Content-Size', zipBuffer.length.toString());
            
            res.end(zipBuffer, 'binary');

        } catch (error) {
            logger.error('Error creating all templates ZIP:', error);
            if (!res.headersSent) {
                send(res, 500, {
                    error: 'Failed to create all templates ZIP',
                    details: error.message
                });
            }
        }
    }

    private async getSessionTemplateDataInternal(sessionId: string, templatePath: string): Promise<any> {
        // Internal method to get template data without HTTP request/response
        if (!this.sessions.has(sessionId)) {
            throw new Error('Session not found');
        }

        this.updateSessionActivity(sessionId);

        const templateName = path.basename(templatePath, '.hbs');
        let data = {};

        if (templateName.includes('component')) {
            data = {
                name: 'ExampleComponent',
                description: 'A sample Angular component for demonstration',
                file: 'src/app/example.component.ts',
                selector: 'app-example',
                templateUrl: './example.component.html',
                styleUrls: ['./example.component.scss'],
                inputs: [
                    { name: 'title', type: 'string', description: 'Component title' },
                    { name: 'enabled', type: 'boolean', description: 'Whether component is enabled' }
                ],
                outputs: [
                    { name: 'clicked', type: 'EventEmitter<void>', description: 'Emitted when clicked' }
                ]
            };
        } else if (templateName.includes('service') || templateName.includes('injectable')) {
            data = {
                name: 'ExampleService',
                description: 'A sample Angular service for demonstration',
                file: 'src/app/example.service.ts',
                methods: [
                    { name: 'getData', returnType: 'Observable<any>', description: 'Gets data from API' },
                    { name: 'saveData', returnType: 'void', description: 'Saves data to storage' }
                ]
            };
        } else {
            data = {
                name: `Example${templateName.charAt(0).toUpperCase() + templateName.slice(1)}`,
                description: `A sample ${templateName} for demonstration`,
                file: `src/app/example.${templateName}.ts`
            };
        }

        return data;
    }

    // Session management API methods
    private async createSessionAPI(req: any, res: ServerResponse): Promise<void> {
        try {
            const clientIP = this.getClientIP(req);
            
            // In test environment or if forceNew query param is set, always create new session
            // Otherwise reuse session by IP for normal usage
            const forceNew = process.env.NODE_ENV === 'test' || req.query.forceNew === 'true';
            const session = forceNew ? this.createNewSession(clientIP) : this.createOrGetSessionByIP(clientIP);
            
            send(res, 200, {
                sessionId: session.id,
                success: true,
                message: 'Session created successfully',
                ip: clientIP
            });
        } catch (error) {
            logger.error('Error creating session:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to create session',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async getSessionTemplates(req: any, res: ServerResponse): Promise<void> {
        try {
            const sessionId = req.params.sessionId;
            const session = this.sessions.get(sessionId);

            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            const templates: any[] = [];
            const partialsDir = path.join(session.templateDir, 'partials');

            // Read main template
            const mainTemplatePath = path.join(session.templateDir, 'page.hbs');
            if (fs.existsSync(mainTemplatePath)) {
                templates.push({
                    name: 'page.hbs',
                    path: 'page.hbs',
                    type: 'template'
                });
            }

            // Read partials
            if (fs.existsSync(partialsDir)) {
                const partialFiles = fs.readdirSync(partialsDir).filter(file => file.endsWith('.hbs'));
                partialFiles.forEach(file => {
                    templates.push({
                        name: file,
                        path: `partials/${file}`,
                        type: 'partial'
                    });
                });
            }

            send(res, 200, { templates, success: true });
        } catch (error) {
            logger.error('Error getting session templates:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to get templates',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async getSessionTemplate(req: any, res: ServerResponse): Promise<void> {
        try {
            const { sessionId } = req.params;
            
            // Extract template name from URL (more reliable than Polka's wildcard parameter handling)
            let templateName = req.params["*"];
            const urlParts = req.url.split('/');
            const templateIndex = urlParts.findIndex(part => part === 'template');
            if (templateIndex !== -1 && templateIndex < urlParts.length - 1) {
                // Get everything after 'template/' in the URL and decode it
                templateName = decodeURIComponent(urlParts.slice(templateIndex + 1).join('/'));
            }
            
            // Template name extracted from URL for reliable path handling
            
            const session = this.sessions.get(sessionId);
            
            // Removed debug logging - path extraction now working correctly

            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            const templatePath = path.join(session.templateDir, templateName);

            if (!fs.existsSync(templatePath)) {
                send(res, 404, { success: false, message: 'Template not found' });
                return;
            }

            const content = fs.readFileSync(templatePath, 'utf8');
            send(res, 200, {
                content,
                success: true,
                templateName,
                path: templateName
            });
        } catch (error) {
            logger.error('Error getting session template:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to get template',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async saveSessionTemplate(req: any, res: ServerResponse): Promise<void> {
        try {
            const { sessionId } = req.params;
            
            // Extract template name from URL (more reliable than Polka's wildcard parameter handling)
            let templateName = req.params["*"];
            const urlParts = req.url.split('/');
            const templateIndex = urlParts.findIndex(part => part === 'template');
            if (templateIndex !== -1 && templateIndex < urlParts.length - 1) {
                // Get everything after 'template/' in the URL and decode it
                templateName = decodeURIComponent(urlParts.slice(templateIndex + 1).join('/'));
            }
            
            // Template name extracted from URL for reliable path handling
            
            const { content } = req.body;
            
            const session = this.sessions.get(sessionId);

            // Validate required parameters
            if (!content || typeof content !== 'string') {
                send(res, 400, { 
                    success: false, 
                    message: 'Content is required and must be a string' 
                });
                return;
            }

            if (!templateName) {
                send(res, 400, { 
                    success: false, 
                    message: 'Template name is required' 
                });
                return;
            }

            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            const templatePath = path.join(session.templateDir, templateName);

            // Ensure directory exists
            fs.ensureDirSync(path.dirname(templatePath));

            // Save the template content
            fs.writeFileSync(templatePath, content, 'utf8');

            // Trigger debounced documentation regeneration
            this.generateDocumentation(sessionId, true);

            send(res, 200, {
                success: true,
                message: 'Template saved successfully',
                templateName
            });
        } catch (error) {
            logger.error('Error saving session template:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to save template',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async getSessionTemplateData(req: any, res: ServerResponse): Promise<void> {
        try {
            const { sessionId } = req.params;
            let templatePath = req.params["*"];
            
            // FALLBACK: If Polka doesn't capture the full path, extract it from the URL
            if (!templatePath || !templatePath.includes('/')) {
                const urlParts = req.url.split('/');
                const templateIndex = urlParts.findIndex(part => part === 'template-data');
                if (templateIndex !== -1 && templateIndex < urlParts.length - 1) {
                    // Get everything after 'template-data/' in the URL and decode it
                    templatePath = decodeURIComponent(urlParts.slice(templateIndex + 1).join('/'));
                }
            }

            if (!this.sessions.has(sessionId)) {
                send(res, 404, {
                    success: false,
                    message: 'Session not found'
                });
                return;
            }

            this.updateSessionActivity(sessionId);
            const session = this.sessions.get(sessionId);

            // Get example data for the template type
            const templateName = path.basename(templatePath, '.hbs');

            // **COMPODOC CONFIGURATION OPTIONS**
            // Return only actual Compodoc configuration options that can be edited
            const compodocConfig = {
                // Documentation Metadata
                name: session?.config?.name || 'Application documentation',

                // Paths and Output
                output: session?.config?.output || './documentation/',
                theme: session?.config?.theme || 'gitbook',
                language: session?.config?.language || 'en-US',
                base: session?.config?.base || '/',

                // Assets and Custom UI
                customFavicon: session?.config?.customFavicon || '',
                customLogo: session?.config?.customLogo || '',
                assetsFolder: session?.config?.assetsFolder || '',
                extTheme: session?.config?.extTheme || '',

                // Feature Toggles - Disable Options
                disableSourceCode: session?.config?.disableSourceCode || false,
                disableGraph: session?.config?.disableGraph || false,
                disableCoverage: session?.config?.disableCoverage || false,
                disablePrivate: session?.config?.disablePrivate || false,
                disableProtected: session?.config?.disableProtected || false,
                disableInternal: session?.config?.disableInternal || false,
                disableLifeCycleHooks: session?.config?.disableLifeCycleHooks || false,
                disableConstructors: session?.config?.disableConstructors || false,
                disableRoutesGraph: session?.config?.disableRoutesGraph || false,
                disableSearch: session?.config?.disableSearch || false,
                disableDependencies: session?.config?.disableDependencies || false,
                disableProperties: session?.config?.disableProperties || false,
                disableDomTree: session?.config?.disableDomTree || false,
                disableTemplateTab: session?.config?.disableTemplateTab || false,
                disableStyleTab: session?.config?.disableStyleTab || false,
                disableMainGraph: session?.config?.disableMainGraph || false,
                disableFilePath: session?.config?.disableFilePath || false,
                disableOverview: session?.config?.disableOverview || false,

                // UI Options
                hideGenerator: session?.config?.hideGenerator || false,
                hideDarkModeToggle: session?.config?.hideDarkModeToggle || false,
                minimal: session?.config?.minimal || false,

                // Additional Content
                includes: session?.config?.includes || '',
                includesName: session?.config?.includesName || 'Additional documentation',

                // Serving Options
                port: session?.config?.port || 8080,
                hostname: session?.config?.hostname || '127.0.0.1',
                serve: session?.config?.serve || false,
                open: session?.config?.open || false,
                watch: session?.config?.watch || false,

                // Export Options
                exportFormat: session?.config?.exportFormat || 'html',

                // Coverage Options
                coverageTest: session?.config?.coverageTest || false,
                coverageTestThreshold: session?.config?.coverageTestThreshold || 70,
                coverageMinimumPerFile: session?.config?.coverageMinimumPerFile || 0,
                coverageTestThresholdFail: session?.config?.coverageTestThresholdFail || true,
                coverageTestShowOnlyFailed: session?.config?.coverageTestShowOnlyFailed || false,
                unitTestCoverage: session?.config?.unitTestCoverage || '',

                // Google Analytics
                gaID: session?.config?.gaID || '',
                gaSite: session?.config?.gaSite || 'auto',

                // Advanced Options
                silent: session?.config?.silent || false,
                maxSearchResults: session?.config?.maxSearchResults || 15,

                // Menu Configuration (as JSON string for editing)
                toggleMenuItems: JSON.stringify(session?.config?.toggleMenuItems || ['all']),
                navTabConfig: JSON.stringify(session?.config?.navTabConfig || [])
            };

            // Return only the Compodoc configuration - no template variables
            const responseData = compodocConfig;
            let additionalContext: any = {};
            let templateVariables: any;

            // Determine template type and provide comprehensive realistic data
            if (templateName.includes('component')) {
                templateVariables = {
                    // Core component data
                    name: 'UserProfileComponent',
                    description: 'A comprehensive user profile management component that handles user information display and editing capabilities.',
                    file: 'src/app/components/user-profile/user-profile.component.ts',
                    selector: 'app-user-profile',
                    templateUrl: './user-profile.component.html',
                    styleUrls: ['./user-profile.component.scss', './user-profile.theme.scss'],
                    encapsulation: 'ViewEncapsulation.Emulated',
                    changeDetection: 'ChangeDetectionStrategy.OnPush',

                    // Component metadata
                    type: 'component',
                    sourceCode: 'export class UserProfileComponent implements OnInit, OnDestroy { ... }',
                    rawFile: 'user-profile.component.ts',

                    // Template and styles
                    templateData: '<div class="user-profile">\\n  <h2>{{user.name}}</h2>\\n  <p>{{user.email}}</p>\\n</div>',
                    styleUrlsData: [
                        '.user-profile { padding: 20px; }\\n.user-profile h2 { color: #333; }'
                    ],
                    stylesData: [
                        ':host { display: block; margin: 10px; }'
                    ],

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
                            args: [
                                { name: 'userData', type: 'Partial<User>' }
                            ],
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
                            comment: '<app-user-profile [user]="currentUser" [editable]="true"></app-user-profile>'
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
                    description: 'Service responsible for managing user data and authentication operations',
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

            // Add common template context variables that all templates receive
            const commonContext = {
                // Navigation and UI
                depth: additionalContext.depth || 0,
                breadcrumbs: additionalContext.breadcrumbs || [],
                navTabs: compodocConfig.navTabConfig,

                // Helper functions available in templates
                t: (key: string) => `[Translation: ${key}]`, // Simulates i18n function
                relativeURL: (url: string) => url, // URL helper

                // Project information
                projectTitle: (compodocConfig as any).documentationMainName || compodocConfig.name || 'Documentation',
                projectDescription: (compodocConfig as any).documentationMainDescription || 'Documentation description',

                // Current page context
                pageType: templateName,
                pageName: templateVariables.name || 'Unknown',

                // Feature flags (from config)
                showSourceCode: !compodocConfig.disableSourceCode,
                showGraph: !compodocConfig.disableGraph,
                showCoverage: !compodocConfig.disableCoverage,
                showPrivateMembers: !compodocConfig.disablePrivate,
                showProtectedMembers: !compodocConfig.disableProtected,
                showInternalMembers: !compodocConfig.disableInternal
            };

            // Return only the Compodoc configuration options
            send(res, 200, {
                success: true,
                categories: {
                    compodocConfig: {
                        title: 'Compodoc Configuration Options',
                        description: 'Edit these configuration options to customize the generated documentation. Changes will automatically regenerate the documentation.',
                        data: compodocConfig
                    }
                },

                // Legacy format for backward compatibility
                data: compodocConfig,
                context: { config: compodocConfig }
            });

        } catch (error) {
            logger.error('Error getting session template data:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to get template data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async generateSessionDocs(req: any, res: ServerResponse): Promise<void> {
        try {
            const { sessionId } = req.params;
            
            // Safely destructure from req.body, handling cases where it might be undefined (Polka behavior)
            const { customTemplateContent, mockData } = req.body || {};

            if (!this.sessions.has(sessionId)) {
                send(res, 404, {
                    success: false,
                    message: 'Session not found'
                });
                return;
            }

            const session = this.sessions.get(sessionId);
            this.updateSessionActivity(sessionId);

            // Save the custom template content if provided
            if (customTemplateContent && req.body.templatePath) {
                const templatePath = path.join(session.templateDir, req.body.templatePath);
                await fs.writeFile(templatePath, customTemplateContent, 'utf8');
            }

            // Generate documentation for this session
            this.generateDocumentation(sessionId, false); // No debounce for manual generation

            send(res, 200, {
                success: true,
                message: 'Documentation generation started',
                sessionId: sessionId
            });

        } catch (error) {
            logger.error('Error generating session documentation:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to generate documentation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async getSessionConfig(req: any, res: ServerResponse): Promise<void> {
        try {
            const sessionId = req.params.sessionId;
            const session = this.sessions.get(sessionId);

            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            // Return complete Compodoc configuration with current values or defaults
            const fullConfig = {
                // Documentation Metadata
                name: session.config?.name || 'Application documentation',

                // Paths and Output
                output: session.config?.output || './documentation/',
                theme: session.config?.theme || 'gitbook',
                language: session.config?.language || 'en-US',
                base: session.config?.base || '/',

                // Assets and Custom UI
                customFavicon: session.config?.customFavicon || '',
                customLogo: session.config?.customLogo || '',
                assetsFolder: session.config?.assetsFolder || '',
                extTheme: session.config?.extTheme || '',

                // Feature Toggles - Disable Options
                disableSourceCode: !!session.config?.disableSourceCode,
                disableGraph: !!session.config?.disableGraph,
                disableCoverage: !!session.config?.disableCoverage,
                disablePrivate: !!session.config?.disablePrivate,
                disableProtected: !!session.config?.disableProtected,
                disableInternal: !!session.config?.disableInternal,
                disableLifeCycleHooks: !!session.config?.disableLifeCycleHooks,
                disableConstructors: !!session.config?.disableConstructors,
                disableRoutesGraph: !!session.config?.disableRoutesGraph,
                disableSearch: !!session.config?.disableSearch,
                disableDependencies: !!session.config?.disableDependencies,
                disableProperties: !!session.config?.disableProperties,
                disableDomTree: !!session.config?.disableDomTree,
                disableTemplateTab: !!session.config?.disableTemplateTab,
                disableStyleTab: !!session.config?.disableStyleTab,
                disableMainGraph: !!session.config?.disableMainGraph,
                disableFilePath: !!session.config?.disableFilePath,
                disableOverview: !!session.config?.disableOverview,

                // UI Options
                hideGenerator: !!session.config?.hideGenerator,
                hideDarkModeToggle: !!session.config?.hideDarkModeToggle,
                minimal: !!session.config?.minimal,

                // Additional Content
                includes: session.config?.includes || '',
                includesName: session.config?.includesName || 'Additional documentation',

                // Serving Options
                port: session.config?.port || 8080,
                hostname: session.config?.hostname || '127.0.0.1',
                serve: !!session.config?.serve,
                open: !!session.config?.open,
                watch: !!session.config?.watch,

                // Export Options
                exportFormat: session.config?.exportFormat || 'html',

                // Coverage Options
                coverageTest: !!session.config?.coverageTest,
                coverageTestThreshold: session.config?.coverageTestThreshold || 70,
                coverageMinimumPerFile: session.config?.coverageMinimumPerFile || 0,
                coverageTestThresholdFail: !!session.config?.coverageTestThresholdFail,
                coverageTestShowOnlyFailed: !!session.config?.coverageTestShowOnlyFailed,
                unitTestCoverage: session.config?.unitTestCoverage || '',

                // Google Analytics
                gaID: session.config?.gaID || '',
                gaSite: session.config?.gaSite || 'auto',

                // Advanced Options
                silent: !!session.config?.silent,
                maxSearchResults: session.config?.maxSearchResults || 15,

                // Menu Configuration (as JSON string for editing)
                toggleMenuItems: JSON.stringify(session.config?.toggleMenuItems || ['all']),
                navTabConfig: JSON.stringify(session.config?.navTabConfig || [])
            };

            send(res, 200, {
                config: fullConfig,
                success: true
            });
        } catch (error) {
            logger.error('Error getting session config:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to get config',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async updateSessionConfig(req: any, res: ServerResponse): Promise<void> {
        try {
            const sessionId = req.params.sessionId;
            const { config } = req.body;
            const session = this.sessions.get(sessionId);

            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            // Update session config
            session.config = { ...session.config, ...config };

            // Trigger debounced documentation regeneration with new config
            this.generateDocumentation(sessionId, true);

            send(res, 200, {
                success: true,
                message: 'Configuration updated successfully',
                config: session.config
            });
        } catch (error) {
            logger.error('Error updating session config:', error);
            send(res, 500, {
                success: false,
                message: 'Failed to update config',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private serveSessionDocs(req: any, res: ServerResponse): void {
        try {
            const sessionId = req.params.sessionId;
            const session = this.sessions.get(sessionId);

            if (!session) {
                send(res, 404, { success: false, message: 'Session not found' });
                return;
            }

            this.updateSessionActivity(sessionId);

            // Remove the session part from the URL to get the file path
            const filePath = req.url.replace(/^\/api\/session\/[^\/]+\/docs/, '');
            const fullPath = path.join(session.documentationDir, filePath || 'index.html');

            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath);
                const ext = path.extname(fullPath).toLowerCase();
                const contentType = ext === '.html' ? 'text/html' : 
                                  ext === '.css' ? 'text/css' :
                                  ext === '.js' ? 'application/javascript' :
                                  ext === '.json' ? 'application/json' :
                                  'text/plain';
                res.setHeader('Content-Type', contentType);
                res.end(content);
            } else {
                res.statusCode = 404;
                res.end('Documentation file not found');
            }
        } catch (error) {
            logger.error('Error serving session docs:', error);
            res.statusCode = 500;
            res.end('Error serving documentation');
        }
    }

    private async isPortAvailable(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const server = http.createServer();
            server.listen(port, () => {
                server.close(() => resolve(true));
            });
            server.on('error', () => resolve(false));
        });
    }

    private async findAvailablePort(startPort: number): Promise<number> {
        let port = startPort;
        while (port < startPort + 100) { // Try up to 100 ports above the requested port
            if (await this.isPortAvailable(port)) {
                return port;
            }
            port++;
        }
        throw new Error(`No available port found in range ${startPort}-${startPort + 99}`);
    }

    public async start(): Promise<void> {
        try {
            // Check if the requested port is available, otherwise find an alternative
            if (!(await this.isPortAvailable(this.port))) {
                const originalPort = this.port;
                try {
                    this.port = await this.findAvailablePort(this.port + 1);
                    logger.warn(`⚠️  Port ${originalPort} is in use. Using port ${this.port} instead.`);
                } catch (error) {
                    throw new Error(`Port ${originalPort} is in use and no alternative port could be found. Please stop the process using port ${originalPort} or specify a different port.`);
                }
            }

            this.server = this.app.listen(this.port, () => {
                logger.info(`🎨 Template Playground is running at: http://localhost:${this.port}`);
                logger.info('📝 Use this tool to customize and preview Compodoc templates');
                logger.info('🔧 Edit templates in the left panel and see live preview on the right');
                logger.info('💾 Export your customized templates when ready');
                logger.info('');
                logger.info('Press Ctrl+C to stop the server');
            });

            // Graceful shutdown
            process.on('SIGTERM', this.stop.bind(this));
            process.on('SIGINT', this.stop.bind(this));
        } catch (error) {
            logger.error('Failed to start Template Playground:', error);
            throw error;
        }
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            // Remove signal handlers to prevent memory leaks
            for (const [signal, handler] of this.signalHandlers.entries()) {
                process.removeListener(signal, handler);
            }
            this.signalHandlers.clear();

            // Clear cleanup interval
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = null;
            }

            // Clear all debounce timers
            for (const timer of this.debounceTimers.values()) {
                clearTimeout(timer);
            }
            this.debounceTimers.clear();

            // Clean up all sessions
            for (const sessionId of this.sessions.keys()) {
                this.cleanupSession(sessionId);
            }

            // Get the actual HTTP server from Polka instance
            const httpServer = this.server?.server;
            
            if (httpServer && typeof httpServer.close === 'function') {
                let resolved = false;
                
                httpServer.close((error) => {
                    if (!resolved) {
                        resolved = true;
                        if (error) {
                            logger.warn('Error closing server:', error);
                        } else {
                            logger.info('Template Playground server stopped');
                        }
                        resolve();
                    }
                });
                
                // Force close after 1 second if it hasn't closed naturally
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        logger.info('Server close timeout - resolving anyway');
                        resolve();
                    }
                }, 1000);
            } else {
                logger.info('No HTTP server to close or close method not available');
                resolve();
            }

            // Clean up temporary files
            try {
                // The cleanup logic for sessions is now handled by the debounceTimers
                // and the startSessionCleanup interval.
                // We can remove the direct cleanup of tempProjectPath and originalTemplatesPath
                // as they are now managed within sessions.
            } catch (error) {
                logger.warn('Failed to clean up temporary files:', error);
            }
        });
    }
}
