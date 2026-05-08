import { Injectable } from "@nestjs/common";
import { REGION_OPTIONS } from "./data/region-options.data";

@Injectable()
export class RegionService {
  getOptions() {
    return REGION_OPTIONS;
  }
}
