
import { allOf } from 'sparkengineweb'
import { describeWithFeature } from './featureFlags';

const UNAVAILABLE_COMPONENTS = new Set(['AnimationComponent', 'SoundComponent']);

const AVAILABLE_COMPONENTS = Object.keys(allOf('Component'))
    .filter(component => !UNAVAILABLE_COMPONENTS.has(component))
    .map(component => component.split('Component')[0]) ?? [];

const openScriptingFromTriggerObject = async (options?: { addEntity?: boolean }) => {
    if (options?.addEntity) {
        const addTriggerButton = page.getByText(/Add TriggerObject/i);
        await addTriggerButton.click();
    }

    const entityItem = page.getByText(/TriggerEntity/i).first();
    await entityItem.click();

    const boundingBoxPanel = page.getByRole('button', { name: /TriggerComponent/i }).first();
    const isExpanded = await boundingBoxPanel.getAttribute('aria-expanded');

    // Keep this helper idempotent: only expand when currently collapsed.
    if (isExpanded !== 'true') {
        await boundingBoxPanel.click();
    }

    const openScriptingButton = page.getByRole('button', { name: /Open Scripting/i });
    const newTabPromise = page.context().waitForEvent('page', { timeout: 5000 });
    await openScriptingButton.click();

    const scriptingPage = await newTabPromise;
    await scriptingPage.waitForLoadState('domcontentloaded');

    await expect(scriptingPage.getByTestId('ScriptingPage')).toBeVisible();
    await expect(scriptingPage.getByText(/Save/i)).toBeVisible();
    await scriptingPage.waitForFunction(() => {
        const editorText = document.querySelector('.view-lines')?.textContent ?? '';
        return editorText.trim() !== '// Write your code here';
    });

    return scriptingPage;
};

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

        it.isolated('Should save the edited script and show it again when reopening scripting', async () => {
            const scriptingPage = await openScriptingFromTriggerObject({ addEntity: true });

            const monacoSurface = scriptingPage.locator('.monaco-editor .view-lines').first();
            await monacoSurface.click();

            const updatedScript = 'function test () { return 42; }';
            await scriptingPage.keyboard.press(`${process.platform === 'darwin' ? 'Meta' : 'Control'}+A`);
            await scriptingPage.keyboard.press('Delete');
            await scriptingPage.keyboard.insertText(updatedScript);

            // wait 500ms
            await scriptingPage.waitForTimeout(500);
            await scriptingPage.getByText(/^Save$/).click();

            // The scripting tab name is reused; close it so reopening creates a fresh tab.
            await scriptingPage.close();

            const reopenedScriptingPage = await openScriptingFromTriggerObject();
            const editorText = await reopenedScriptingPage.locator('.view-lines').textContent();

            expect(editorText).toLookSame(updatedScript);
        });
    })

    describeWithFeature('ADD_COMPONENTS', 'Add Component feature', () => {
        beforeEach(async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const addComponentButton = page.getByText(/Add Component/i);
            await addComponentButton.click();
        });

        it('Should show list of available components when Add Component button is clicked', async () => {
            await Promise.all(AVAILABLE_COMPONENTS.map(async (componentName: string) => {
                const componentsPanel = page.getByRole('listbox', { name: /Components Panel/i });

                return expect(componentsPanel.getByRole('option', { name: componentName })).toBeVisible();
            }));
        });

        it.each(AVAILABLE_COMPONENTS)('Should add %s component to a selected entity', async (componentName: string) => {
            const componentsPanel = page.getByRole('listbox', { name: /Components Panel/i });

            const componentOption = componentsPanel.getByRole('option', { name: componentName });
            await componentOption.click();

            await expect((await page.getByText(componentName).all()).at(0)).toBeVisible();
        });

        it('Should close the Components Panel when clicking Close button', async () => {
            const closeButton = page.getByRole('button', { name: /Close/i });
            await closeButton.click();

            const componentsPanel = page.getByRole('listbox', { name: /Components Panel/i });
            await expect(componentsPanel).not.toBeVisible();
        });

        it('Should close the Components Panel when clicking outside', async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const componentsPanel = page.getByRole('listbox', { name: /Components Panel/i });
            await expect(componentsPanel).not.toBeVisible();
        });
    });

    describeWithFeature('ADD_COMPONENTS', 'Component Removal', () => {
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
    }, () => {
        it('It should not show delete component button', async () => {
            const addEntityButton = page.getByText(/Add GameObject/i);
            await addEntityButton.click();

            const entityItem = page.getByText(/GameObject1/i);
            await entityItem.click();

            const transformPanel = page.getByRole('region', { name: /Transform/i });
            const deleteButton = transformPanel.getByRole('button', { name: ' X ', exact: true });
            await expect(deleteButton).not.toBeVisible();
        });
    });
});
