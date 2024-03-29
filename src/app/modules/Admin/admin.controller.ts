import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {adminServices} from "./admin.service";

const getAllAdmins = catchAsync(async (req, res) => {
  const result = await adminServices.getAllAdmins(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "All Admins Retrieved Successfully",
    meta: result.meta,
    data: result.result,
  });
});

const getSingleAdmin = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await adminServices.getSingleAdmin(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Admin is Retrieved Successfully",
    data: result,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const {id} = req.params;
  const {admin} = req.body;
  const result = await adminServices.updateAdmin(id, admin);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Admin updated successfully",
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const {id} = req.params;
  const result = await adminServices.deleteAdmin(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const adminControllers = {
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
};
