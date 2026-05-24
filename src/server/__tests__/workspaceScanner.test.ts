import { test } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { scanWorkspace } from '../workspaceScanner';

test('Workspace Scanner Core Logic Suite', async (t) => {
  const testRoot = path.join(process.cwd(), 'temp_test_workspace_dir');

  // Set up temporary directories and test files
  await t.test('Setup test assets', async () => {
    await fs.promises.mkdir(testRoot, { recursive: true });
    await fs.promises.mkdir(path.join(testRoot, 'src/components'), { recursive: true });

    // 1. Create a package.json
    const packageContent = {
      dependencies: {
        'react': '^18.0.0',
        'framer-motion': '^10.0.0'
      },
      devDependencies: {
        'typescript': '^5.0.0'
      }
    };
    await fs.promises.writeFile(
      path.join(testRoot, 'package.json'),
      JSON.stringify(packageContent, null, 2),
      'utf8'
    );

    // 2. Create a .env.example
    const envExampleContent = `
PORT=3000
DATABASE_URL=postgres://localhost/db
GEMINI_API_KEY=
    `;
    await fs.promises.writeFile(
      path.join(testRoot, '.env.example'),
      envExampleContent,
      'utf8'
    );

    // 3. Create a source file with TODOs, imports, and env vars
    const sourceFileContent = `
import React from 'react';
import { motion } from 'framer-motion';
import lodash from 'lodash/map';
import { someHelper } from './helper';

// TODO: Refactor this component to use custom hook template
// FIXME: Resolve race condition inside fetch operation
// MOCK: Serve dummy profiles

export function MyComponent() {
  const apiKey = process.env.GEMINI_API_KEY;
  const missingVar = process.env.UNCONFIGURED_VAR;
  return (
    <div>Test Component</div>
  );
}
    `;
    await fs.promises.writeFile(
      path.join(testRoot, 'src/components/MyComponent.tsx'),
      sourceFileContent,
      'utf8'
    );
  });

  // Execute scanWorkspace and inspect summary
  await t.test('Scan test workspace & verify structures', async () => {
    const summary = await scanWorkspace(testRoot);

    // Assert files list
    assert.ok(summary.files.length > 0, 'Should find scanned files');
    
    const targetFile = summary.files.find(f => f.relativePath === path.join('src', 'components', 'MyComponent.tsx').replace(/\\/g, '/'));
    assert.ok(targetFile, 'MyComponent.tsx should be listed in scanned files');

    // Verify TODOs
    const componentTodos = targetFile.todos;
    assert.strictEqual(componentTodos.length, 3, 'Should find exactly 3 todo annotations');
    assert.ok(componentTodos.some(t => t.text.includes('TODO: Refactor this component')), 'Should fetch TODO');
    assert.ok(componentTodos.some(t => t.text.includes('FIXME: Resolve race condition')), 'Should fetch FIXME');
    assert.ok(componentTodos.some(t => t.text.includes('MOCK: Serve dummy profiles')), 'Should fetch MOCK');

    // Verify Imports and stripping subpaths
    assert.deepStrictEqual(summary.dependencies, ['react', 'framer-motion'], 'Should read dependencies');
    assert.deepStrictEqual(summary.devDependencies, ['typescript'], 'Should read devDependencies');

    assert.ok(targetFile.imports.includes('react'), 'Should list react import');
    assert.ok(targetFile.imports.includes('framer-motion'), 'Should list framer-motion import');
    assert.ok(targetFile.imports.includes('lodash'), 'Should strip subpaths and list lodash');
    assert.ok(!targetFile.imports.includes('./helper'), 'Should filter out relative imports');

    // Verify Environment variables used
    assert.ok(targetFile.envVarsUsed.includes('GEMINI_API_KEY'), 'Should track process.env variables');
    assert.ok(targetFile.envVarsUsed.includes('UNCONFIGURED_VAR'), 'Should track unconfigured variables');

    // Verify Missing dependencies and unconfigured environment variables
    assert.ok(summary.missingDeps.includes('lodash'), 'lodash should be marked as imported but missing in package.json');
    assert.ok(summary.missingConfigs.includes('UNCONFIGURED_VAR'), 'UNCONFIGURED_VAR should be marked as missing in .env.example');
  });

  // Clean up temporary files
  await t.test('Teardown test assets', async () => {
    await fs.promises.rm(testRoot, { recursive: true, force: true });
  });
});
