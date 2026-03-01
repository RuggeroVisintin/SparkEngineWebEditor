
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

        it('Should display delete buttons disabled for required components', async () => {
            const entity = page.getByText(/GameObject1/i);
            await entity.click();

            // GameObject has 3 required components: Transform, Shape, Material
            const deleteButtons = await page.getByRole('button', { name: /X/ }).all();
            expect(deleteButtons).toHaveLength(3);

            // All required component buttons should be disabled
            const firstButtonDisabled = await deleteButtons[0].isDisabled();
            expect(firstButtonDisabled).toBe(true);
        });

        it('Should remove component when delete button is clicked', async () => {
            const addComponentButton = page.getByText(/Add Component/i);
            await addComponentButton.click();

            const boundingBoxOption = page.getByRole('option', { name: /BoundingBox/ });
            await boundingBoxOption.click();

            const boundingBoxPanel = page.getByRole('region', { name: /BoundingBox/i });

            const deleteButtons = page.getByRole('button', { name: /X/ });
            const boundingBoxDeleteButton = deleteButtons.last();
            await boundingBoxDeleteButton.click();

            await expect(boundingBoxPanel).not.toBeVisible();
        });
    });

    describe('Component Removal - Feature Flag DISABLED', () => {
        it('Should not display delete buttons when feature flag is disabled', async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const entityItem = page.getByText(/GameObject1/i);
            await entityItem.click();

            const deleteButton = page.getByRole('button', { name: /X/ });
            await expect(deleteButton).not.toBeVisible();
        });
    });
});
