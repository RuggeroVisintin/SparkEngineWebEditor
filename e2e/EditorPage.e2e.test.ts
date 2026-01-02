
import { allOf } from 'sparkengineweb'
import { describeWithFeature } from './featureFlags';

describe('Editor Page - Components Panel', () => {

    it('Should add a new GameObject to the scene', async () => {
        const addEntityButton = page.getByText(/Add GameObject/i);
        await addEntityButton.click();

        await expect(page.getByText(/GameObject1/i)).toBeVisible();
    });

    describe('Entity Props', () => { 
        it('Should show Entity Props Panel when an entity is selected', async () => {
            const entityItem = page.getByText(/GameObject1/i);
            await entityItem.click();

            await expect(page.getByRole('group', { name: /Entity Properties/i })).toBeVisible();
        });
    })

    describeWithFeature('ADD_COMPONENTS', 'Add Component feature', () => {
        const AVAILABLE_COMPONENTS = Object.keys(allOf('Component')).map(component => component.split('Component')[0]) ?? [];

        beforeEach(async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const addComponentButton = page.getByText(/Add Component/i);
            await addComponentButton.click();
        });

        it('Should show list of available components when Add Component button is clicked', async () => {
            await Promise.all(AVAILABLE_COMPONENTS.map(async (componentName: string) => {
                return expect(page.getByRole('option', { name: componentName })).toBeVisible();
            }));
        });

        it.each(AVAILABLE_COMPONENTS)('Should add %s component to a selected entity', async (componentName: string) => {
            const componentOption = page.getByRole('option', { name: componentName });
            await componentOption.click();

            // Check if the component is added to the selected entity
            await expect(page.getByText(componentName)).toBeVisible();
        });

        it('Should close the Components Panel when clicking outside', async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const componentsPanel = page.getByRole('listbox', { name: /Components Panel/i });
            await expect(componentsPanel).not.toBeVisible();
        });
    });
});