import {StudentServices} from "./student.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const getStudents = catchAsync(async (req, res) => {
  const result = await StudentServices.getAllStudents(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "students is retrieved successfully",
    meta: result.meta,
    data: result.result,
  });
});

const getSingleStudent = catchAsync(async (req, res) => {
  const {id} = req.params;
  const result = await StudentServices.getSingleStudent(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Student is retrieved successfully",
    data: result,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const {id} = req.params;
  const {student} = req.body;
  const result = await StudentServices.updateStudent(id, student);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Student updated successfully",
    data: result,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  const {id} = req.params;
  const result = await StudentServices.deleteStudent(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Student deleted successfully",
    data: result,
  });
});

export const StudentControllers = {
  getStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
