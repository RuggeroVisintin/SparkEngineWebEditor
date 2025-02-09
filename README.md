# Spark Engine Web Editor

## Overview

Spark Engine Web Editor is a browser based editor for the SparkEngine game engine.
It leverages web technology to ensure high compatibility with many devices and enable web based frution without requiring any installation.

## Getting Started

1) Clone the project
2) `npm i` to install needed dependencies
3) `npm start` to launch the editor

### Local Development Enhancements

If you are part of the core contributors to the project, there is a great chance you also need to debug the core of sparkengine.
To enhance your experience, you can link the project directly against the local `sparkengineweb` repository like so:

1) Open a terminal and move to the root of this project
2) `cp dev.env .env` 
3) replace `<path/to/sparkengine/local/repo>` with the absolute path of the cloned `sparkengineweb` project
4) you can now make changes to the `sparkengineweb` project and rebuild, the changes will be automatically applied here too

### Prerequisites

* Node ^20
* Npm ^10

## Contributing

### How to contribute

1. Fork the repository
2. Create a new branch (`git checkout -b yourName/feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Reporting Issues

If you encounter any bugs or have suggestions for improvements, please open an issue on our GitHub repository. Provide as much detail as possible, including steps to reproduce the issue.

### Git Conventions

To know more about any checks running inside git hooks please refer to [docs/git-conventions.md](docs/git-conventions.md)

## License

See [LICENSE](LICENSE) file
