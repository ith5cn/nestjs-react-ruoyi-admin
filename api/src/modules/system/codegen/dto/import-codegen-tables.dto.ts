export interface ImportCodegenTableItemDto {
  tableName: string;
  tableComment?: string;
}

export interface ImportCodegenTablesDto {
  source: string;
  tables: ImportCodegenTableItemDto[];
}
