
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
    })



    // test('Should open components panel when Add Component button is clicked', async ({ page }) => {
    //     // Similar setup - ensure we have an entity selected
    //     await page.waitForSelector('canvas', { timeout: 10000 });

    //     // Select an entity (adjust based on your actual UI)
    //     const entityInScene = page.getByTestId('scene-panel').locator('text=Entity').first();
    //     if (await entityInScene.isVisible()) {
    //         await entityInScene.click();
    //     }

    //     // Click the Add Component button
    //     const addComponentButton = page.getByRole('button', { name: /Add Component/i });
    //     await addComponentButton.click();

    //     // Check if the components panel opens
    //     // Based on your Editor component, this should show "Material Component"
    //     await expect(page.getByText('Material Component')).toBeVisible();
    // });
});