import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";

interface OfficialBusinessQuery {
  employeeNumber?: string;
  identityCardNo?: string;
  positionGrade?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose.connect('mongodb+srv://pakiza:pakiza@pakiza.63v0o1n.mongodb.net');

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

app.get(
  "/api/official-business",
  (req: Request<{}, {}, {}, OfficialBusinessQuery>, res: Response) => {
    try {
      const filter: Record<string, any> = {};

      if (req.query.employeeNumber)
        filter.employeeNumber = req.query.employeeNumber;
      if (req.query.identityCardNo)
        filter.identityCardNo = req.query.identityCardNo;
      if (req.query.positionGrade)
        filter.positionGrade = req.query.positionGrade;
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
  }
);

app.get("/api/official-business/:id", (req: any, res: any) => {
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

app.post("/api/official-business", (req: Request, res: Response) => {
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

app.put("/api/official-business/:id", (req: any, res: any) => {
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

app.delete("/api/official-business/:id", (req: any, res: any) => {
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
  (req: any, res: any) => {
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

          const documentPath = `/uploads/documents/${req.params.id}/${req.file?.filename}`;
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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
