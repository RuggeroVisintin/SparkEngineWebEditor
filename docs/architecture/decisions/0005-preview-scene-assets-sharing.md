# 5. preview-scene-assets-sharing

Date: 2026-06-01

## Status

Proposed

## Context

Assets are being loaded from the file system in the editor, which requires to prompt users to provide a project folder that is being kept as a context.

This is an approach we cannot afford in the preview tab if we want to provide a good enough UX.

See [Assets access management ADR](./0002-assets-access-management.md)


### Proposed Solutions

- Serialize assets content as buffers in the messagge payload
- Leverage engine build functionality, which does not exist yet 

#### Serialize assets content as buffers in the messagge payload

In short, this solution consists of serializing into a buffer the data of an assets, so that the engine in the preview tab can use the data to use the assets without reading from disk again

* Good because it is a fairly simple solution
* Bad because it is an ad hoc solution which would require specific solution for core mechanics of the engine (for example file streaming)
* Bad because it may not scale to the size of a scene

#### Leverage engine build functionality

This solution consists of using a build of the game to pass to open in the preview

* Good because it would reuse core engine functionality
* Good because it would not have concern of scaling to a game size being a bundle of files
* Bad becuase it would still require explicit interaction from the user, breaking the seamless experience we want to provide with the preview
* Bad because it would make it harder to preview specific scenes / interactions of the engine 

## Decision

The decision is to proceed with solution #1 for now, with the main rational being the ability to provide a samealess user experience and being fairly simple to implement

* We will implement a serialization/deserialization mechanism in the editor scene srialization logic to serialize a scene assets' data in the payload excanged with the preview tab
* We will defer developing specific streaming mechanics to when needed –If needed


## Consequences

👍 Implementation simplicity

👍 Seamless User Eperience

👎 Ad hoc implementation may require future additional work due to not reusing feature built for the final game

👎 Scalability may prove challenging in the future