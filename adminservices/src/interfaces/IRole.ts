export interface IRole {
  _id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
}

export interface IRoleInputDTO {
  path: string;
  title: string;
  icon: string;
  submenu: [
    {
      path: String;
      title: String;
      icon: String;
    },
  ];
}
