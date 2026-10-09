import { Request } from "../../request/entities/request.entity.js";
import { RequestItemStatus } from '../../../../../generated/prisma/enums.js';
import { Physical } from "../../../books/physical/entities/physical.entity.js";

export class Item {
    id!: number;
    requestId!: number;
    physicalCopyId!: number;
    status!: RequestItemStatus;
    request?: Request;
    physical?: Physical;
}
