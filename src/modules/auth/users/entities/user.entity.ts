export class User {
    id!: number;
    roleId!: number;
    firstName!: string;
    lastName!: string;
    userName!: string;
    email!: string;
    password!: string;
    phoneNumber?: string | null;
}
