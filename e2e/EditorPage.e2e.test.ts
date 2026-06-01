
import { allOf } from 'sparkengineweb'
import { describeWithFeature } from './featureFlags';

const UNAVAILABLE_COMPONENTS = new Set(['AnimationComponent', 'SoundComponent']);

const AVAILABLE_COMPONENTS = Object.keys(allOf('Component'))
    .filter(component => !UNAVAILABLE_COMPONENTS.has(component))
    .map(component => component.split('Component')[0]) ?? [];

const sampleEnginePixel = async (targetPage: typeof page, x: number, y: number): Promise<[number, number, number, number]> => {
    await targetPage.waitForSelector('canvas[aria-label="Engine View"]', { state: 'attached' });
    const engineCanvas = targetPage.locator('canvas[aria-label="Engine View"]').first();

    return engineCanvas.evaluate((canvas, coords) => {
        const context = (canvas as HTMLCanvasElement).getContext('2d');

        if (!context) {
            return [0, 0, 0, 0] as [number, number, number, number];
        }

        const [r, g, b, a] = context.getImageData(coords.x, coords.y, 1, 1).data;
        return [r, g, b, a] as [number, number, number, number];
    }, { x, y });
};

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

    describeWithFeature('PREVIEW_MODE', 'Preview Mode', () => {
        it('Should open preview workspace with engine view only when clicking Preview', async () => {
            await page.setViewportSize({ width: 1000, height: 1000 });

            const newTabPromise = page.context().waitForEvent('page', { timeout: 5000 });
            await page.getByRole('option', { name: /Preview/i }).click();
            const previewPage = await newTabPromise;

            await previewPage.waitForLoadState('domcontentloaded');

            await expect(previewPage.getByLabel(/Engine View/i)).toBeVisible();
            await expect(previewPage.getByRole('option', { name: /Add GameObject/i })).not.toBeVisible();

            const overflowMetrics = await previewPage.evaluate(() => {
                const doc = document.documentElement;

                return {
                    hasVerticalOverflow: doc.scrollHeight > window.innerHeight,
                    hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
                };
            });

            expect(overflowMetrics.hasVerticalOverflow).toBe(false);
            expect(overflowMetrics.hasHorizontalOverflow).toBe(false);

            const viewport = previewPage.viewportSize();
            const canvasBounds = await previewPage.getByLabel(/Engine View/i).boundingBox();

            expect(viewport).toBeTruthy();
            expect(canvasBounds).toBeTruthy();

            const viewportCenterX = (viewport?.width ?? 0) / 2;
            const viewportCenterY = (viewport?.height ?? 0) / 2;
            const canvasCenterX = (canvasBounds?.x ?? 0) + ((canvasBounds?.width ?? 0) / 2);
            const canvasCenterY = (canvasBounds?.y ?? 0) + ((canvasBounds?.height ?? 0) / 2);

            expect(Math.round(canvasCenterX)).toBe(Math.round(viewportCenterX));
            expect(Math.round(canvasCenterY)).toBe(Math.round(viewportCenterY));
        });

        it('Should render the current scene in preview', async () => {
            await page.getByText(/Add GameObject/i).click();
            await expect(page.getByText(/GameObject1/i)).toBeVisible();

            await page.waitForFunction(() => {
                const canvas = document.querySelector<HTMLCanvasElement>('[aria-label="Engine View"]');
                if (!canvas) return false;

                const context = canvas.getContext('2d');
                if (!context) return false;

                const [r, g, b] = context.getImageData(60, 60, 1, 1).data;
                return r > 0 || g > 0 || b > 0;
            });

            const editorPixel = await sampleEnginePixel(page, 60, 60);
            expect(editorPixel[0]).toBeGreaterThan(0);

            const newTabPromise = page.context().waitForEvent('page', { timeout: 5000 });
            await page.getByRole('option', { name: /Preview/i }).click();
            const previewPage = await newTabPromise;

            await previewPage.waitForLoadState('domcontentloaded');

            const previewPixel = await sampleEnginePixel(previewPage, 60, 60);
            expect(previewPixel).toEqual(editorPixel);
        });
    });

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
