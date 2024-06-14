# HaoKe CLI GitHub Action

Installs HaoKe CLI in your GitHub Actions.


## Usage

```yaml
name: haoke-cli

on:
  pull_request:
  push:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Install HaoKe CLI
        uses: haokeyingxiao/haoke-cli-action@v1

      - name: Build and Package Extension
        run: haoke-cli extension zip .
```

