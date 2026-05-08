import { BaseController } from "@/common/controllers/base.controller";
import { Controller, Get, Query } from "@nestjs/common";
import { PostEntity } from "./entities/post.entity";
import { PostService } from "./post.service";
import { BypassEncryption } from "@/common/decorators/bypass-encryption.decorator";

// @BypassEncryption()
@Controller('system/post')
export class PostController extends BaseController<PostEntity> {
    constructor(private readonly postService: PostService) {
        super(postService);
    }

    /**
     * 岗位列表
     */
    @Get('index')
    async index(@Query() query: any) {
        let { page = 1, limit = 10, size, ...options } = query;
        const pageSize = Number(size || limit);
        const pageNum = Number(page);

        const where = this.postService.buildWhere(options, {
            likes: ['name', 'code'],
            equals: ['status']
        });

        // 按照sort排序
        const order: any = { sort: "ASC", id: "ASC" };
        const data = await this.postService.getList(pageNum, pageSize, { where, order });

        return data;
    }

    /**
     * 可访问的岗位
     */
    @Get('access')
    async access() {
        return await this.postService.getAccess()
    }
}
