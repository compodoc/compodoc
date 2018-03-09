import { MainDataInterface } from './main-data.interface';
import { PageInterface } from './page.interface';

export interface ConfigurationInterface {
    mainData: MainDataInterface;
    pages: PageInterface[];
    addPage(page: PageInterface): void;
    addAdditionalPage(page: PageInterface): void;
    hasPage(name: string): void;
    resetPages(): void;
    resetAdditionalPages(): void;
    resetRootMarkdownPages(): void;
}
