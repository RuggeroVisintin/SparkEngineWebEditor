
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
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const entityItem = page.getByText(/GameObject1/i);
            await entityItem.click();

            await expect(page.getByRole('region', { name: /Transform/i })).toBeVisible();
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

            await expect((await page.getByText(componentName).all()).at(0)).toBeVisible();
        });

        it('Should close the Components Panel when clicking outside', async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const componentsPanel = page.getByRole('listbox', { name: /Components Panel/i });
            await expect(componentsPanel).not.toBeVisible();
        });
    });

    describe('Component Removal', () => {
        beforeEach(async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();
        });

        it('Should display delete buttons disabled for required components', async () => {
            const entityItem = page.getByText(/GameObject1/i);
            await entityItem.click();

            // Get all component regions in the panel
            const transformPanel = page.getByRole('region', { name: /TransformComponent/i });
            const shapePanel = page.getByRole('region', { name: /ShapeComponent/i });
            const materialPanel = page.getByRole('region', { name: /MaterialComponent/i });

            // Check that all required components have disabled delete buttons
            const transformDeleteBtn = transformPanel.getByRole('button', { name: ' X ', exact: true });
            const shapeDeleteBtn = shapePanel.getByRole('button', { name: ' X ', exact: true });
            const materialDeleteBtn = materialPanel.getByRole('button', { name: ' X ', exact: true });

            const transformDisabled = await transformDeleteBtn.isDisabled();
            const shapeDisabled = await shapeDeleteBtn.isDisabled();
            const materialDisabled = await materialDeleteBtn.isDisabled();

            expect(transformDisabled).toBe(true);
            expect(shapeDisabled).toBe(true);
            expect(materialDisabled).toBe(true);
        });

        it('Should remove component when delete button is clicked', async () => {
            const entityItem = page.getByText(/GameObject1/i);
            await entityItem.click();

            const addComponentButton = page.getByText(/Add Component/i);
            await addComponentButton.click();

            const boundingBoxOption = page.getByRole('option', { name: /BoundingBox/ });
            await boundingBoxOption.click();

            // Get the BoundingBox component region
            const boundingBoxPanel = page.getByRole('region', { name: /BoundingBoxComponent/i });
            await expect(boundingBoxPanel).toBeVisible();

            // Get the delete button specifically from the BoundingBox panel
            const boundingBoxDeleteButton = boundingBoxPanel.getByRole('button', { name: ' X ', exact: true });

            // Verify it's enabled (not a required component)
            const isDisabled = await boundingBoxDeleteButton.isDisabled();
            expect(isDisabled).toBe(false);

            // Click the delete button
            await boundingBoxDeleteButton.click();

            // BoundingBox panel should no longer be visible
            await expect(boundingBoxPanel).not.toBeVisible();
        });
    })
});
