# Oficina integracao 2 API

## Description

This is a college project developed for educational purposes.

## Requirements

Before running this project, make sure you have Docker installed on your machine.

## Setup

1. Create a `.env` file in the root directory of the project.
2. Use the `.env.example` file as a template to fill in the required environment variables. Make sure to set appropriate values for variables like `PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc.

## Testing

To find the testing files, look for files named with `.spec`. You can run all automated tests by running:

```bash
npm run test
```

## Usage

To run the project, follow these steps:

1. Open a terminal.
2. Clone this repository to your local machine.
3. Navigate to the project directory.
4. Run the following command to build and start the Docker containers:

   ```bash
   docker-compose up -d --build
   ```

   This command will build the Docker images for the project and start the containers in detached mode.

5. Once the containers are up and running, you can access your application at `http://localhost:<PORT>`, where `<PORT>` is the port specified in your `.env` file.

## Additional Information

- If you need to stop the containers, you can run:

  ```bash
  docker-compose down
  ```

- To view logs from the containers, you can use:

  ```bash
  docker-compose logs
  ```

- If you make changes to the code or environment variables, you may need to rebuild the containers using the `--build` flag.

## Troubleshooting

- If you encounter any issues during setup or while running the project, please refer to the documentation or feel free to reach out for assistance.
