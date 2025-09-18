// Copyright (c) 2025 Lab Essentials. MIT License.

import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
});
