/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import express, {NextFunction, Response, Request} from "express";
import {UserControllers} from "./user.controller";

import {StudentValidationSchema} from "../student/student.validation";
import validateRequest from "../../middlewares/validateRequest";
import {createFacultyValidationSchema} from "../Faculty/faculty.validation";
import {createAdminValidationSchema} from "../Admin/admin.validation";
import auth from "../../middlewares/auth";
import {USER_ROLE} from "./user.constant";
import {UserValidation} from "./user.validation";
import {upload} from "../../utils/sendImageToCloudinary";

const router = express.Router();

router.post(
  "/create-student",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(StudentValidationSchema),
  UserControllers.createStudent
);

router.post(
  "/create-faculty",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(createFacultyValidationSchema),
  UserControllers.createFaculty
);

router.post(
  "/create-admin",
  auth(USER_ROLE.superAdmin),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(createAdminValidationSchema),
  UserControllers.createAdmin
);

router.post(
  "/change-status/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus
);

router.get(
  "/me",
  auth("superAdmin", "student", "admin", "faculty"),
  UserControllers.getMe
);

export const UserRoutes = router;
