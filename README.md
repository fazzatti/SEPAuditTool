# SEPAuditTool

Welcome to SEPAuditTool, a command-line utility designed to ensure that smart contracts on the Stellar network comply with Stellar Ecosystem Proposals (SEPs). This tool automates the process of checking smart contracts against established SEP standards, helping developers to identify and correct issues before deployment.

## Status

**Note: This project is currently a work in progress (WIP).** Features and documentation are under development and may change significantly. Feedback and contributions are welcome!

## Features

- **Pristine Ledger Setup:** Initializes a clean ledger environment for testing.
- **Test Network Connection:** Connects to a Stellar test network to execute and validate smart contracts.
- **SEP Compliance Verification:** Automatically verifies smart contracts against specific SEP requirements.

## Getting Started

To get started with SEPAuditTool, clone this repository and install the necessary dependencies. Detailed instructions will be added as the project progresses.

## Usage

<TODO>

For now you can clone the repository, run the following command to build:

```bash
pnpm run dev
```

After that, you can create a link to the project in your environment by running:

```bash
pnpm run link
```

(To unlink the project, there is also a 'unlink' command avaialable)

Aftern linking the project, it will be globally accessible through the command `sepaudit`.

### Example

To run the audit for SEP41 using a wasm file one can run:

```bash
sepaudit sep 41 -w '<path to wasm file>'
```

## Contributing

Contributors are welcome to help advance SEPAuditTool. If you're interested in contributing, please fork the repository and submit a pull request, or contact us directly for more details on how to get involved.

## License

This project is licensed under the [MIT License](LICENSE.md). See the LICENSE file for more information.
