#!/bin/bash

# Get the current version from package.json
ORGANIZATION="ordersgrid"
USERNAME="khachikgh"
VERSION=$(node -p "require('./package.json').version")
APP_NAME=$(node -p "require('./package.json').name")
APP_NAME="$APP_NAME-stage"

# Split the version into major, minor, and patch components
MAJOR=$(echo $VERSION | cut -d. -f1)
MINOR=$(echo $VERSION | cut -d. -f2)
PATCH=$(echo $VERSION | cut -d. -f3)

# # # # Increment the patch component
PATCH=$((PATCH + 1))

# Set the new version
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# # # # Update the version in package.json
npm version $NEW_VERSION --no-git-tag-version

# Build the Docker image
docker build -t $APP_NAME:$NEW_VERSION .

# Tag Image with Version Number
docker tag $APP_NAME:$NEW_VERSION $ORGANIZATION/$APP_NAME:$NEW_VERSION

# Tag Image with the Latest Tag
docker tag $APP_NAME:$NEW_VERSION $ORGANIZATION/$APP_NAME:latest

# Log in to Docker Hub using the credential helper
docker login -u $USERNAME

# Push the Docker image to Docker Hub with the Version Number
docker push $ORGANIZATION/$APP_NAME:$NEW_VERSION

# Push the Docker image to Docker Hub with the Latest Tag
docker push $ORGANIZATION/$APP_NAME:latest