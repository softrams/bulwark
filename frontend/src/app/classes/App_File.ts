export class AppFile {
  constructor(
    private id: number,
    public buffer: any,
    public encoding: string,
    public fieldName: string,
    public mimetype: string,
    public originalname: string,
    public size: string,
    public imgUrl: string
  ) {}
}
