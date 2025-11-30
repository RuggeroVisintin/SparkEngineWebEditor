
describe('Editor Page - Components Panel', () => {
    it('Should add a new GameObject to the scene', async () => {
        const addEntityButton = page.getByText(/Add GameObject/i);
        await addEntityButton.click();

        await expect(page.getByText(/GameObject1/i)).toBeVisible();
    });

    test('Should add a new custom component to a selected entity', async () => {
        const addEntityButton = page.getByText(/Add GameObject/i);
        await addEntityButton.click();

        const addComponentButton = page.getByText(/Add Component/i);
        await addComponentButton.click();

        // TODO: use RigidBodyComponent instead
        await expect(await page.getByText('Rigid Body Component')).toBeVisible();
    });

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