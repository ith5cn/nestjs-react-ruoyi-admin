export interface RegionOption {
  label: string;
  value: string;
  children?: RegionOption[];
}

export const REGION_OPTIONS: RegionOption[] = [
  {
    label: "北京市",
    value: "110000",
    children: [
      {
        label: "北京市",
        value: "110100",
        children: [
          { label: "东城区", value: "110101" },
          { label: "西城区", value: "110102" },
          { label: "朝阳区", value: "110105" },
        ],
      },
    ],
  },
  {
    label: "天津市",
    value: "120000",
    children: [
      {
        label: "天津市",
        value: "120100",
        children: [
          { label: "和平区", value: "120101" },
          { label: "河西区", value: "120103" },
          { label: "南开区", value: "120104" },
        ],
      },
    ],
  },
  {
    label: "河北省",
    value: "130000",
    children: [
      {
        label: "石家庄市",
        value: "130100",
        children: [
          { label: "长安区", value: "130102" },
          { label: "桥西区", value: "130104" },
          { label: "新华区", value: "130105" },
        ],
      },
    ],
  },
  {
    label: "山西省",
    value: "140000",
    children: [
      {
        label: "太原市",
        value: "140100",
        children: [
          { label: "小店区", value: "140105" },
          { label: "迎泽区", value: "140106" },
          { label: "杏花岭区", value: "140107" },
        ],
      },
    ],
  },
  {
    label: "内蒙古自治区",
    value: "150000",
    children: [
      {
        label: "呼和浩特市",
        value: "150100",
        children: [
          { label: "新城区", value: "150102" },
          { label: "回民区", value: "150103" },
          { label: "玉泉区", value: "150104" },
        ],
      },
    ],
  },
  {
    label: "辽宁省",
    value: "210000",
    children: [
      {
        label: "沈阳市",
        value: "210100",
        children: [
          { label: "和平区", value: "210102" },
          { label: "沈河区", value: "210103" },
          { label: "大东区", value: "210104" },
        ],
      },
    ],
  },
  {
    label: "吉林省",
    value: "220000",
    children: [
      {
        label: "长春市",
        value: "220100",
        children: [
          { label: "南关区", value: "220102" },
          { label: "宽城区", value: "220103" },
          { label: "朝阳区", value: "220104" },
        ],
      },
    ],
  },
  {
    label: "黑龙江省",
    value: "230000",
    children: [
      {
        label: "哈尔滨市",
        value: "230100",
        children: [
          { label: "道里区", value: "230102" },
          { label: "南岗区", value: "230103" },
          { label: "道外区", value: "230104" },
        ],
      },
    ],
  },
  {
    label: "上海市",
    value: "310000",
    children: [
      {
        label: "上海市",
        value: "310100",
        children: [
          { label: "黄浦区", value: "310101" },
          { label: "徐汇区", value: "310104" },
          { label: "浦东新区", value: "310115" },
        ],
      },
    ],
  },
  {
    label: "江苏省",
    value: "320000",
    children: [
      {
        label: "南京市",
        value: "320100",
        children: [
          { label: "玄武区", value: "320102" },
          { label: "秦淮区", value: "320104" },
          { label: "建邺区", value: "320105" },
        ],
      },
    ],
  },
  {
    label: "浙江省",
    value: "330000",
    children: [
      {
        label: "杭州市",
        value: "330100",
        children: [
          { label: "上城区", value: "330102" },
          { label: "拱墅区", value: "330105" },
          { label: "西湖区", value: "330106" },
        ],
      },
    ],
  },
  {
    label: "安徽省",
    value: "340000",
    children: [
      {
        label: "合肥市",
        value: "340100",
        children: [
          { label: "瑶海区", value: "340102" },
          { label: "庐阳区", value: "340103" },
          { label: "蜀山区", value: "340104" },
        ],
      },
    ],
  },
  {
    label: "福建省",
    value: "350000",
    children: [
      {
        label: "福州市",
        value: "350100",
        children: [
          { label: "鼓楼区", value: "350102" },
          { label: "台江区", value: "350103" },
          { label: "仓山区", value: "350104" },
        ],
      },
    ],
  },
  {
    label: "江西省",
    value: "360000",
    children: [
      {
        label: "南昌市",
        value: "360100",
        children: [
          { label: "东湖区", value: "360102" },
          { label: "西湖区", value: "360103" },
          { label: "青云谱区", value: "360104" },
        ],
      },
    ],
  },
  {
    label: "山东省",
    value: "370000",
    children: [
      {
        label: "济南市",
        value: "370100",
        children: [
          { label: "历下区", value: "370102" },
          { label: "市中区", value: "370103" },
          { label: "槐荫区", value: "370104" },
        ],
      },
    ],
  },
  {
    label: "河南省",
    value: "410000",
    children: [
      {
        label: "郑州市",
        value: "410100",
        children: [
          { label: "中原区", value: "410102" },
          { label: "二七区", value: "410103" },
          { label: "金水区", value: "410105" },
        ],
      },
    ],
  },
  {
    label: "湖北省",
    value: "420000",
    children: [
      {
        label: "武汉市",
        value: "420100",
        children: [
          { label: "江岸区", value: "420102" },
          { label: "江汉区", value: "420103" },
          { label: "武昌区", value: "420106" },
        ],
      },
    ],
  },
  {
    label: "湖南省",
    value: "430000",
    children: [
      {
        label: "长沙市",
        value: "430100",
        children: [
          { label: "芙蓉区", value: "430102" },
          { label: "天心区", value: "430103" },
          { label: "岳麓区", value: "430104" },
        ],
      },
    ],
  },
  {
    label: "广东省",
    value: "440000",
    children: [
      {
        label: "广州市",
        value: "440100",
        children: [
          { label: "越秀区", value: "440104" },
          { label: "海珠区", value: "440105" },
          { label: "天河区", value: "440106" },
        ],
      },
      {
        label: "深圳市",
        value: "440300",
        children: [
          { label: "福田区", value: "440304" },
          { label: "南山区", value: "440305" },
          { label: "宝安区", value: "440306" },
        ],
      },
    ],
  },
  {
    label: "广西壮族自治区",
    value: "450000",
    children: [
      {
        label: "南宁市",
        value: "450100",
        children: [
          { label: "兴宁区", value: "450102" },
          { label: "青秀区", value: "450103" },
          { label: "西乡塘区", value: "450107" },
        ],
      },
    ],
  },
  {
    label: "海南省",
    value: "460000",
    children: [
      {
        label: "海口市",
        value: "460100",
        children: [
          { label: "秀英区", value: "460105" },
          { label: "龙华区", value: "460106" },
          { label: "美兰区", value: "460108" },
        ],
      },
    ],
  },
  {
    label: "重庆市",
    value: "500000",
    children: [
      {
        label: "重庆市",
        value: "500100",
        children: [
          { label: "万州区", value: "500101" },
          { label: "渝中区", value: "500103" },
          { label: "江北区", value: "500105" },
        ],
      },
    ],
  },
  {
    label: "四川省",
    value: "510000",
    children: [
      {
        label: "成都市",
        value: "510100",
        children: [
          { label: "锦江区", value: "510104" },
          { label: "青羊区", value: "510105" },
          { label: "武侯区", value: "510107" },
        ],
      },
    ],
  },
  {
    label: "贵州省",
    value: "520000",
    children: [
      {
        label: "贵阳市",
        value: "520100",
        children: [
          { label: "南明区", value: "520102" },
          { label: "云岩区", value: "520103" },
          { label: "观山湖区", value: "520115" },
        ],
      },
    ],
  },
  {
    label: "云南省",
    value: "530000",
    children: [
      {
        label: "昆明市",
        value: "530100",
        children: [
          { label: "五华区", value: "530102" },
          { label: "盘龙区", value: "530103" },
          { label: "西山区", value: "530112" },
        ],
      },
    ],
  },
  {
    label: "西藏自治区",
    value: "540000",
    children: [
      {
        label: "拉萨市",
        value: "540100",
        children: [
          { label: "城关区", value: "540102" },
          { label: "堆龙德庆区", value: "540103" },
          { label: "达孜区", value: "540104" },
        ],
      },
    ],
  },
  {
    label: "陕西省",
    value: "610000",
    children: [
      {
        label: "西安市",
        value: "610100",
        children: [
          { label: "新城区", value: "610102" },
          { label: "碑林区", value: "610103" },
          { label: "雁塔区", value: "610113" },
        ],
      },
    ],
  },
  {
    label: "甘肃省",
    value: "620000",
    children: [
      {
        label: "兰州市",
        value: "620100",
        children: [
          { label: "城关区", value: "620102" },
          { label: "七里河区", value: "620103" },
          { label: "安宁区", value: "620105" },
        ],
      },
    ],
  },
  {
    label: "青海省",
    value: "630000",
    children: [
      {
        label: "西宁市",
        value: "630100",
        children: [
          { label: "城东区", value: "630102" },
          { label: "城中区", value: "630103" },
          { label: "城西区", value: "630104" },
        ],
      },
    ],
  },
  {
    label: "宁夏回族自治区",
    value: "640000",
    children: [
      {
        label: "银川市",
        value: "640100",
        children: [
          { label: "兴庆区", value: "640104" },
          { label: "西夏区", value: "640105" },
          { label: "金凤区", value: "640106" },
        ],
      },
    ],
  },
  {
    label: "新疆维吾尔自治区",
    value: "650000",
    children: [
      {
        label: "乌鲁木齐市",
        value: "650100",
        children: [
          { label: "天山区", value: "650102" },
          { label: "沙依巴克区", value: "650103" },
          { label: "水磨沟区", value: "650105" },
        ],
      },
    ],
  },
  {
    label: "台湾省",
    value: "710000",
    children: [
      {
        label: "台北市",
        value: "710100",
        children: [
          { label: "中正区", value: "710101" },
          { label: "大同区", value: "710102" },
          { label: "信义区", value: "710110" },
        ],
      },
    ],
  },
  {
    label: "香港特别行政区",
    value: "810000",
    children: [
      {
        label: "香港岛",
        value: "810100",
        children: [
          { label: "中西区", value: "810101" },
          { label: "湾仔区", value: "810102" },
          { label: "东区", value: "810103" },
        ],
      },
    ],
  },
  {
    label: "澳门特别行政区",
    value: "820000",
    children: [
      {
        label: "澳门半岛",
        value: "820100",
        children: [
          { label: "花地玛堂区", value: "820101" },
          { label: "圣安多尼堂区", value: "820102" },
          { label: "大堂区", value: "820103" },
        ],
      },
    ],
  },
];
