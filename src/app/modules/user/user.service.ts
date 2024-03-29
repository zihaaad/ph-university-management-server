/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import config from "../../config";
import {AcademicSemester} from "../academicSemester/academicSemester.model";
import {TStudent} from "../student/student.interface";
import {Student} from "../student/student.model";
import {TUser} from "./user.interface";
import {User} from "./user.model";
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from "./user.utils";
import {AppError} from "../../errors/AppError";
import httpStatus from "http-status";
import {TFaculty} from "../Faculty/faculty.interface";
import {AcademicDepartment} from "../academicDepartment/academicDepartment.model";
import {Faculty} from "../Faculty/faculty.model";
import {TAdmin} from "../Admin/admin.interface";
import {Admin} from "../Admin/admin.model";
import {JwtPayload} from "jsonwebtoken";
import {sendImageToCloudinary} from "../../utils/sendImageToCloudinary";

const createStudent = async (
  file: any,
  password: string,
  studentData: TStudent
) => {
  const userData: Partial<TUser> = {};

  userData.password = password || (config.default_password as string);

  userData.role = "student";
  userData.email = studentData.email;

  const admissionSemester: any = await AcademicSemester.findById(
    studentData.admissionSemester
  );

  if (!admissionSemester) {
    throw new AppError(400, "Admission semester not found");
  }

  // find department
  const academicDepartment = await AcademicDepartment.findById(
    studentData.academicDepartment
  );

  if (!academicDepartment) {
    throw new AppError(400, "Aademic department not found");
  }

  studentData.academicFaculty = academicDepartment.academicFaculty;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    userData.id = await generateStudentId(admissionSemester);

    if (file) {
      const imageName = `${userData.id}${studentData?.name?.firstName}`;
      const path = file?.path;

      const {secure_url}: any = await sendImageToCloudinary(imageName, path);
      studentData.profileImg = secure_url as string;
    }
    // create a user (transaction-1)
    const newUser = await User.create([userData], {session});

    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed To Create User");
    }

    studentData.id = newUser[0].id;
    studentData.user = newUser[0]._id; // reference _id

    // create a student (transaction-2)
    const newStudent = await Student.create([studentData], {session});
    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to create student");
    }

    await session.commitTransaction();
    await session.endSession();

    return newStudent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.NOT_ACCEPTABLE, err);
  }
};

const createFaculty = async (
  file: any,
  password: string,
  payload: TFaculty
) => {
  const userData: Partial<TUser> = {};

  userData.password = password || (config.default_password as string);

  userData.role = "faculty";
  userData.email = payload.email;

  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDepartment
  );

  if (!academicDepartment) {
    throw new AppError(400, "Academic department not found");
  }

  payload.academicFaculty = academicDepartment?.academicFaculty;

  if (file) {
    const imageName = `${userData.id}${payload?.name.firstName}`;
    const path = file?.path;

    const {secure_url}: any = await sendImageToCloudinary(imageName, path);
    payload.profileImg = secure_url as string;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    userData.id = await generateFacultyId();

    const newUser = await User.create([userData], {session});

    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed To Create User");
    }

    payload.id = newUser[0].id;
    payload.user = newUser[0]._id;

    const newFaculty = await Faculty.create([payload], {session});

    if (!newFaculty.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed To Create Faculty");
    }

    await session.commitTransaction();
    await session.endSession();

    return newFaculty;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const createAdmin = async (file: any, password: string, payload: TAdmin) => {
  const userData: Partial<TUser> = {};

  userData.password = password || config.default_password;
  userData.role = "admin";
  userData.email = payload.email;

  if (file) {
    const imageName = `${userData.id}${payload?.name.firstName}`;
    const path = file?.path;

    const {secure_url}: any = await sendImageToCloudinary(imageName, path);
    payload.profileImg = secure_url as string;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    userData.id = await generateAdminId();
    const newUser = await User.create([userData], {session});

    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to create Admin");
    }

    payload.id = newUser[0].id;
    payload.user = newUser[0]._id;

    const newAdmin = await Admin.create([payload], {session});

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed To Create Admin");
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error);
  }
};

const getMe = async (payload: JwtPayload) => {
  const {role, userId} = payload;

  let result = null;

  if (role === "student") {
    result = await Student.findOne({id: userId}).populate("user");
  }
  if (role === "faculty") {
    result = await Faculty.findOne({id: userId}).populate("user");
  }
  if (role === "admin") {
    result = await Admin.findOne({id: userId}).populate("user");
  }

  return result;
};

const changeStatus = async (id: string, payload: {status: string}) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const UserServices = {
  createStudent,
  createFaculty,
  createAdmin,
  changeStatus,
  getMe,
};
