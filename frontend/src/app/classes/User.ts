export class User {
  id: number;
  firstName: string;
  lastName: string;
  title: string;

  constructor(id: number, firstName: string, lastName: string, title: string) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.title = title;
  }
}
