import * as xss from 'xss';

export class XssUtil {
    private static readonly whiteList = (() => {
        const whiteList = xss.getDefaultWhiteList();
        whiteList.img = ['src', 'alt', 'title', 'width', 'height', 'style', 'data-href'];
        whiteList.p = ['style'];
        whiteList.span = ['style'];
        whiteList.div = ['style'];
        whiteList.table = ['style', 'width', 'border', 'cellspacing', 'cellpadding'];
        whiteList.thead = ['style'];
        whiteList.tbody = ['style'];
        whiteList.tr = ['style'];
        whiteList.th = ['style', 'colspan', 'rowspan', 'width'];
        whiteList.td = ['style', 'colspan', 'rowspan', 'width'];
        whiteList.pre = ['style'];
        whiteList.code = ['style'];
        whiteList.blockquote = ['style'];
        whiteList.h1 = ['style'];
        whiteList.h2 = ['style'];
        whiteList.h3 = ['style'];
        whiteList.h4 = ['style'];
        whiteList.h5 = ['style'];
        whiteList.h6 = ['style'];
        return whiteList;
    })();

    private static readonly xssFilter = new xss.FilterXSS({
        // 保留常见富文本标签与必要属性，继续剥离危险标签和事件属性
        whiteList: this.whiteList,
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style', 'xml', 'iframe', 'frame']
    });

    /**
     * 深度遍历清理对象中的 XSS 危险内容
     * @param data 任意数据
     * @returns 清理后的数据
     */
    static sanitize(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }

        if (typeof data === 'string') {
            return this.xssFilter.process(data);
        }

        if (Array.isArray(data)) {
            return data.map(item => this.sanitize(item));
        }

        if (typeof data === 'object') {
            const result: any = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    result[key] = this.sanitize(data[key]);
                }
            }
            return result;
        }

        return data; // number, boolean 等直接返回
    }
}
