import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Server, Socket } from "socket.io";
import type { Request } from "express";

export type SocketEventHandler<
  Data = { [p in string]: any },
  WithSocketObject = { socket: Socket } & Data
> = (params: WithSocketObject) => any;

export type IO = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export interface RequestWithIO extends Request {
  io: IO;
}
