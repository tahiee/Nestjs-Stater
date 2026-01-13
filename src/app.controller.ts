import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";

@Controller()
export class AppController {
  @Get()
  getIndex(@Res() res: Response) {
    const publicPath =
      process.env.NODE_ENV === "production"
        ? join(process.cwd(), "public", "index.html")
        : join(__dirname, "..", "public", "index.html");

    res.sendFile(publicPath);
  }

  @Get("api")
  getApiDocumentation(@Res() res: Response) {
    const apiPath =
      process.env.NODE_ENV === "production"
        ? join(process.cwd(), "public", "api.html")
        : join(__dirname, "..", "public", "api.html");

    res.sendFile(apiPath);
  }
}
