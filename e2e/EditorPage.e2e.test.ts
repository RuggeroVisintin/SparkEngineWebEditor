
import { allOf } from 'sparkengineweb'
import { describeWithFeature } from './featureFlags';

describe('Editor Page - Components Panel', () => {
    it('Should add a new GameObject to the scene', async () => {
        const addEntityButton = page.getByText(/Add GameObject/i);
        await addEntityButton.click();

        await expect(page.getByText(/GameObject1/i)).toBeVisible();
    });

    describeWithFeature('ADD_COMPONENTS', 'Add Component feature', () => {
        beforeEach(async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const addComponentButton = page.getByText(/Add Component/i);
            await addComponentButton.click();
        });

        it('Should show list of available components when Add Component button is clicked', async () => {
            const components = allOf('Component');

            await Promise.all(Object.keys(components).map(async (componentName: string) => {
                return expect(page.getByRole('option', { name: componentName.split('Component')[0] })).toBeVisible();
            }));
        });

        it('Should add a new custom component to a selected entity', async () => {
            const componentName = 'BoundingBox';
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