const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose.connect(
  process.env.MONGODB_URI ||
    "mongodb+srv://pakiza:pakiza@pakiza.63v0o1n.mongodb.net"
);

const officialBusinessSchema = new mongoose.Schema(
  {
    applicationReferenceNo: {
      type: String,
      required: true,
      unique: true,
    },
    agencyDivision: {
      type: String,
      required: true,
    },
    branchUnit: {
      type: String,
      required: true,
    },
    employeeNumber: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    identityCardNo: {
      type: String,
      required: true,
      index: true,
    },
    positionGrade: {
      type: String,
      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    expirationDateTime: {
      type: Date,
      required: true,
    },
    updateDateTime: {
      type: Date,
    },
    typeOfBusiness: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    information: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    supportingDocuments: [
      {
        type: String,
      },
    ],
    recordStatus: {
      type: String,
      enum: ["Active", "Finished", "Canceled", "End"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const OfficialBusinessDeclaration = mongoose.model(
  "OfficialBusinessDeclaration",
  officialBusinessSchema
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.params.id;
    const dir = `./public/uploads/documents/${id}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.get("/api/official-business", (req, res) => {
  try {
    const filter = {};
    if (req.query.applicationReferenceNo)
      filter.applicationReferenceNo = req.query.applicationReferenceNo;
    if (req.query.branchUnit) filter.branchUnit = req.query.branchUnit;
    if (req.query.typeOfBusiness)
      filter.typeOfBusiness = req.query.typeOfBusiness;
    if (req.query.employeeNumber)
      filter.employeeNumber = req.query.employeeNumber;
    if (req.query.identityCardNo)
      filter.identityCardNo = req.query.identityCardNo;
    if (req.query.positionGrade) filter.positionGrade = req.query.positionGrade;
    if (req.query.status) filter.recordStatus = req.query.status;

    if (req.query.startDateFrom || req.query.startDateTo) {
      filter.startDateTime = {};
      if (req.query.startDateFrom)
        filter.startDateTime.$gte = new Date(req.query.startDateFrom);
      if (req.query.startDateTo)
        filter.startDateTime.$lte = new Date(req.query.startDateTo);
    }

    OfficialBusinessDeclaration.find(filter)
      .sort({ createdAt: -1 })
      .then((declarations) => {
        res.json(declarations);
      })
      .catch((error) => {
        console.error("Error fetching declarations:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error fetching declarations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/official-business/:id", (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    OfficialBusinessDeclaration.findById(req.params.id)
      .then((declaration) => {
        if (!declaration) {
          return res.status(404).json({ message: "Declaration not found" });
        }
        res.json(declaration);
      })
      .catch((error) => {
        console.error("Error fetching declaration:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error fetching declaration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/official-business", (req, res) => {
  try {
    const newDeclaration = new OfficialBusinessDeclaration({
      ...req.body,
      updateDateTime: new Date(),
    });

    newDeclaration
      .save()
      .then((savedDeclaration) => {
        res.status(201).json(savedDeclaration);
      })
      .catch((error) => {
        console.error("Error creating declaration:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error creating declaration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/official-business/:id", (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    OfficialBusinessDeclaration.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updateDateTime: new Date(),
      },
      { new: true, runValidators: true }
    )
      .then((updatedDeclaration) => {
        if (!updatedDeclaration) {
          return res.status(404).json({ message: "Declaration not found" });
        }
        res.json(updatedDeclaration);
      })
      .catch((error) => {
        console.error("Error updating declaration:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error updating declaration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/official-business/:id", (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    OfficialBusinessDeclaration.findByIdAndDelete(req.params.id)
      .then((deletedDeclaration) => {
        if (!deletedDeclaration) {
          return res.status(404).json({ message: "Declaration not found" });
        }
        res.json({ success: true });
      })
      .catch((error) => {
        console.error("Error deleting declaration:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error deleting declaration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post(
  "/api/official-business/:id/documents",
  upload.single("document"),
  (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      OfficialBusinessDeclaration.findById(req.params.id)
        .then((declaration) => {
          if (!declaration) {
            return res.status(404).json({ message: "Declaration not found" });
          }

          if (!req.file) {
            return res.status(400).json({ message: "No document provided" });
          }

          const documentPath = `/uploads/documents/${req.params.id}/${req.file.filename}`;

          declaration.supportingDocuments = [
            ...(declaration.supportingDocuments || []),
            documentPath,
          ];

          return declaration.save();
        })
        .then((updatedDeclaration) => {
          if (!updatedDeclaration) return;

          const documentPath = `/uploads/documents/${req.params.id}/${req.file.filename}`;
          res.json({ documentUrl: documentPath });
        })
        .catch((error) => {
          console.error("Error uploading document:", error);
          res.status(500).json({ message: "Internal server error" });
        });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Endpoints for hdr-kal-ram
// Model for Ramadan rest period applications
const ramadanRestPeriodSchema = new mongoose.Schema(
  {
    applicationReferenceNo: {
      type: String,
      unique: true,
    },
    employeeNumber: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    identityCardNo: {
      type: String,
      required: true,
      index: true,
    },
    ministry: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      required: true,
    },
    branchUnit: {
      type: String,
      required: true,
    },
    positionGrade: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    breakTimeOption: {
      type: String,
      required: true,
      enum: ["Ramadan Month WBF"],
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    applicationStatus: {
      type: String,
      enum: ["New", "Approved", "Not Approved", "Cancelled"],
      default: "New",
    },
    approvalDate: {
      type: Date,
    },
    approvedBy: {
      name: {
        type: String,
      },
      identityCardNo: {
        type: String,
      },
    },
    notes: {
      type: String,
    },
    supportingDocuments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Automatically generate application reference number before saving
ramadanRestPeriodSchema.pre("save", async function (next) {
  if (!this.applicationReferenceNo) {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Count existing applications for this year to generate sequential number
    const count = await this.constructor.countDocuments({
      applicationReferenceNo: { $regex: `^RAM-${currentYear}` },
    });

    // Generate reference number in format: RAM-YYYY-NNNN (NNNN is sequential number with leading zeros)
    this.applicationReferenceNo = `RAM-${currentYear}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

const RamadanRestPeriod = mongoose.model(
  "RamadanRestPeriod",
  ramadanRestPeriodSchema
);

// Model for user eligibility settings
const eligibilitySettingSchema = new mongoose.Schema({
  breakOption: {
    type: String,
    required: true,
  },
  eligibilityType: {
    type: String,
    required: true,
    enum: ["WBF", "Female", "Pregnant", "Husband of Pregnant", "Authorization"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
});

const EligibilitySetting = mongoose.model(
  "EligibilitySetting",
  eligibilitySettingSchema
);

// Model for department heads
const departmentHeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  identityCardNo: {
    type: String,
    required: true,
    unique: true,
  },
  ministry: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const DepartmentHead = mongoose.model("DepartmentHead", departmentHeadSchema);

// ============ ELIGIBILITY SETTINGS ENDPOINTS ============
// Initial eligibility settings setup on server start
const setupEligibilitySettings = async () => {
  try {
    const count = await EligibilitySetting.countDocuments();
    if (count === 0) {
      await EligibilitySetting.create([
        {
          breakOption: "Ramadan Month WBF",
          eligibilityType: "WBF",
          isActive: true,
          description:
            "Only Competency Owners who use Flexible Working Hours (WBF) are allowed to apply for a break period for the month of Ramadan.",
        },
        {
          breakOption: "Flexible Working Hours During Ramadan",
          eligibilityType: "Authorization",
          isActive: false,
          description:
            "Flexible Working Hours During Ramadan Due to Using Authorization Facilities",
        },
        {
          breakOption: "1 Hour Early Departure",
          eligibilityType: "Female",
          isActive: false,
          description: "1 Hour Early Departure for Female Employees",
        },
        {
          breakOption: "Pregnant And Husband",
          eligibilityType: "Pregnant",
          isActive: false,
          description: "Pregnant And Husband",
        },
      ]);
      console.log("Eligibility settings initialized");
    }
  } catch (error) {
    console.error("Error initializing eligibility settings:", error);
  }
};

setupEligibilitySettings();

// Get all eligibility settings
app.get("/api/eligibility-settings", async (req, res) => {
  try {
    const settings = await EligibilitySetting.find({});
    res.json(settings);
  } catch (error) {
    console.error("Error fetching eligibility settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update eligibility setting
app.put("/api/eligibility-settings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, description } = req.body;

    const updatedSetting = await EligibilitySetting.findByIdAndUpdate(
      id,
      { isActive, description },
      { new: true, runValidators: true }
    );

    if (!updatedSetting) {
      return res.status(404).json({ message: "Eligibility setting not found" });
    }

    res.json(updatedSetting);
  } catch (error) {
    console.error("Error updating eligibility setting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============ REST PERIOD APPLICATION ENDPOINTS ============

// Get list of all applications with filtering options
app.get("/api/ramadan-rest-periods", async (req, res) => {
  try {
    const filter = {};

    // Apply filters based on query parameters
    if (req.query.applicationReferenceNo) {
      filter.applicationReferenceNo = req.query.applicationReferenceNo;
    }
    if (req.query.employeeNumber) {
      filter.employeeNumber = req.query.employeeNumber;
    }
    if (req.query.identityCardNo) {
      filter.identityCardNo = req.query.identityCardNo;
    }
    if (req.query.ministry) {
      filter.ministry = req.query.ministry;
    }
    if (req.query.division) {
      filter.division = req.query.division;
    }
    if (req.query.branchUnit) {
      filter.branchUnit = req.query.branchUnit;
    }
    if (req.query.positionGrade) {
      filter.positionGrade = req.query.positionGrade;
    }
    if (req.query.applicationStatus) {
      filter.applicationStatus = req.query.applicationStatus;
    }

    // Date range filters
    if (req.query.startDateFrom || req.query.startDateTo) {
      filter.startDate = {};
      if (req.query.startDateFrom) {
        filter.startDate.$gte = new Date(req.query.startDateFrom);
      }
      if (req.query.startDateTo) {
        filter.startDate.$lte = new Date(req.query.startDateTo);
      }
    }

    if (req.query.applicationDateFrom || req.query.applicationDateTo) {
      filter.applicationDate = {};
      if (req.query.applicationDateFrom) {
        filter.applicationDate.$gte = new Date(req.query.applicationDateFrom);
      }
      if (req.query.applicationDateTo) {
        filter.applicationDate.$lte = new Date(req.query.applicationDateTo);
      }
    }

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await RamadanRestPeriod.countDocuments(filter);

    // Get applications with pagination
    const applications = await RamadanRestPeriod.find(filter)
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      applications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching rest period applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single application by ID
app.get("/api/ramadan-rest-periods/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const application = await RamadanRestPeriod.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Error fetching rest period application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new application
app.post("/api/ramadan-rest-periods", async (req, res) => {
  try {
    // Check eligibility for Ramadan Month WBF
    const eligibilitySetting = await EligibilitySetting.findOne({
      breakOption: "Ramadan Month WBF",
      isActive: true,
    });

    if (!eligibilitySetting) {
      return res.status(403).json({
        message:
          "Applications for Ramadan rest periods are currently not accepted",
      });
    }

    // Check if user already has an active application
    const existingApplication = await RamadanRestPeriod.findOne({
      identityCardNo: req.body.identityCardNo,
      applicationStatus: { $in: ["New", "Approved"] },
    });

    if (existingApplication) {
      return res.status(400).json({
        message:
          "You already have an active application for this Ramadan period",
      });
    }

    // Create new application
    const newApplication = new RamadanRestPeriod({
      ...req.body,
      applicationDate: new Date(),
      applicationStatus: "New",
    });

    await newApplication.save();

    res.status(201).json({
      message:
        "Application for a break period for the month of Ramadan has been successfully submitted. A notification will be sent to the Head of Department for approval.",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error creating rest period application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cancel application (by employee)
app.put("/api/ramadan-rest-periods/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const application = await RamadanRestPeriod.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only allow cancellation of applications that are in "New" status
    if (application.applicationStatus !== "New") {
      return res.status(400).json({
        message: "Only pending applications can be cancelled by the employee",
      });
    }

    application.applicationStatus = "Cancelled";
    await application.save();

    res.json({
      message: "Application for rest period has been successfully cancelled.",
      application,
    });
  } catch (error) {
    console.error("Error cancelling rest period application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Process applications (approve/reject) - by department head
app.put("/api/ramadan-rest-periods/:id/process", async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationStatus, notes, approvedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (!["Approved", "Not Approved"].includes(applicationStatus)) {
      return res.status(400).json({
        message:
          "Invalid application status. Must be 'Approved' or 'Not Approved'",
      });
    }

    if (!approvedBy || !approvedBy.name || !approvedBy.identityCardNo) {
      return res.status(400).json({
        message: "Department head information is required",
      });
    }

    const application = await RamadanRestPeriod.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only allow processing of applications that are in "New" status
    if (application.applicationStatus !== "New") {
      return res.status(400).json({
        message: "Only new applications can be processed",
      });
    }

    // Update application
    application.applicationStatus = applicationStatus;
    application.approvalDate = new Date();
    application.approvedBy = approvedBy;

    if (notes) {
      application.notes = notes;
    }

    await application.save();

    const statusMessage =
      applicationStatus === "Approved"
        ? "The application for a Rest Period for the Month of Ramadan has been approved for the selected Competency Owner."
        : "The application for a Rest Period for the Month of Ramadan has been rejected.";

    res.json({
      message: `${statusMessage} Notifications will be sent to the Competency Owner and Division Administrative Officer.`,
      application,
    });
  } catch (error) {
    console.error("Error processing rest period application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Batch approval of multiple applications
app.post("/api/ramadan-rest-periods/batch-process", async (req, res) => {
  try {
    const { applicationIds, applicationStatus, notes, approvedBy } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Application IDs array is required" });
    }

    if (!["Approved", "Not Approved"].includes(applicationStatus)) {
      return res.status(400).json({
        message:
          "Invalid application status. Must be 'Approved' or 'Not Approved'",
      });
    }

    if (!approvedBy || !approvedBy.name || !approvedBy.identityCardNo) {
      return res.status(400).json({
        message: "Department head information is required",
      });
    }

    // Validate all IDs
    const invalidIds = applicationIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: `Invalid ID format for: ${invalidIds.join(", ")}`,
      });
    }

    // Process all applications
    const updateData = {
      applicationStatus,
      approvalDate: new Date(),
      approvedBy,
    };

    if (notes) {
      updateData.notes = notes;
    }

    const result = await RamadanRestPeriod.updateMany(
      {
        _id: { $in: applicationIds },
        applicationStatus: "New", // Only update applications in "New" status
      },
      { $set: updateData }
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        message: "No eligible applications found for batch processing",
      });
    }

    const statusMessage =
      applicationStatus === "Approved"
        ? "The applications for Rest Period for the Month of Ramadan have been approved."
        : "The applications for Rest Period for the Month of Ramadan have been rejected.";

    res.json({
      message: `${statusMessage} Notifications will be sent to the Competency Owners and Division Administrative Officers.`,
      processedCount: result.nModified,
    });
  } catch (error) {
    console.error("Error batch processing rest period applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cancel approved applications (by department head or admin)
app.put("/api/ramadan-rest-periods/:id/admin-cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const application = await RamadanRestPeriod.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only allow cancellation of approved applications
    if (application.applicationStatus !== "Approved") {
      return res.status(400).json({
        message: "Only approved applications can be cancelled by admin",
      });
    }

    application.applicationStatus = "Cancelled";
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    res.json({
      message:
        "The Ramadan Rest Period has been successfully cancelled. Notifications will be sent to the Head of Department and Divisional Administrative Officer.",
      application,
    });
  } catch (error) {
    console.error("Error cancelling approved rest period:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Upload supporting document
app.post(
  "/api/ramadan-rest-periods/:id/documents",
  upload.single("document"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No document provided" });
      }

      const application = await RamadanRestPeriod.findById(id);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const documentPath = `/uploads/documents/${id}/${req.file.filename}`;

      application.supportingDocuments = [
        ...(application.supportingDocuments || []),
        documentPath,
      ];

      await application.save();

      res.json({
        message: "Document uploaded successfully",
        documentUrl: documentPath,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ============ DEPARTMENT HEAD ENDPOINTS ============

// Get all department heads
app.get("/api/department-heads", async (req, res) => {
  try {
    const departmentHeads = await DepartmentHead.find({});
    res.json(departmentHeads);
  } catch (error) {
    console.error("Error fetching department heads:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new department head
app.post("/api/department-heads", async (req, res) => {
  try {
    const { name, identityCardNo, ministry, division } = req.body;

    // Check if department head already exists
    const existingHead = await DepartmentHead.findOne({ identityCardNo });
    if (existingHead) {
      return res.status(400).json({
        message:
          "Department head with this identity card number already exists",
      });
    }

    const newDepartmentHead = new DepartmentHead({
      name,
      identityCardNo,
      ministry,
      division,
      isActive: true,
    });

    await newDepartmentHead.save();

    res.status(201).json({
      message: "Department head added successfully",
      departmentHead: newDepartmentHead,
    });
  } catch (error) {
    console.error("Error creating department head:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update department head
app.put("/api/department-heads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ministry, division, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const departmentHead = await DepartmentHead.findById(id);

    if (!departmentHead) {
      return res.status(404).json({ message: "Department head not found" });
    }

    // Update fields
    departmentHead.name = name || departmentHead.name;
    departmentHead.ministry = ministry || departmentHead.ministry;
    departmentHead.division = division || departmentHead.division;

    if (isActive !== undefined) {
      departmentHead.isActive = isActive;
    }

    await departmentHead.save();

    res.json({
      message: "Department head updated successfully",
      departmentHead,
    });
  } catch (error) {
    console.error("Error updating department head:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============ REPORTS AND STATISTICS ============

// Get statistics for dashboard
app.get("/api/statistics", async (req, res) => {
  try {
    const totalApplications = await RamadanRestPeriod.countDocuments();
    const pendingApplications = await RamadanRestPeriod.countDocuments({
      applicationStatus: "New",
    });
    const approvedApplications = await RamadanRestPeriod.countDocuments({
      applicationStatus: "Approved",
    });
    const rejectedApplications = await RamadanRestPeriod.countDocuments({
      applicationStatus: "Not Approved",
    });
    const cancelledApplications = await RamadanRestPeriod.countDocuments({
      applicationStatus: "Cancelled",
    });

    res.json({
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      cancelledApplications,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get applications by department/division
app.get("/api/reports/by-department", async (req, res) => {
  try {
    const results = await RamadanRestPeriod.aggregate([
      {
        $group: {
          _id: { ministry: "$ministry", division: "$division" },
          total: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$applicationStatus", "Approved"] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$applicationStatus", "New"] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$applicationStatus", "Not Approved"] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$applicationStatus", "Cancelled"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { "_id.ministry": 1, "_id.division": 1 },
      },
    ]);

    res.json(results);
  } catch (error) {
    console.error("Error generating department report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

//listen on a port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
