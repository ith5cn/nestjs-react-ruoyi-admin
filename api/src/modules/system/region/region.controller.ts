import { Controller, Get } from "@nestjs/common";
import { RegionService } from "./region.service";

@Controller("system/region")
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get("options")
  options() {
    return this.regionService.getOptions();
  }
}
