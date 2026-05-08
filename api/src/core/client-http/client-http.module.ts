import { Global, Module } from "@nestjs/common";
import { ClientHttpService } from "./client-http.service";
import { HttpModule } from "@nestjs/axios";

@Global()
@Module({
    imports: [HttpModule.register({
        timeout: 5000,
        maxRedirects: 5,
    })],
    providers: [ClientHttpService],
    exports: [ClientHttpService]
})
export class ClientHttpModule { }