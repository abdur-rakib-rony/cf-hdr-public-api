"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.static("public"));
mongoose_1.default.connect('mongodb+srv://pakiza:pakiza@pakiza.63v0o1n.mongodb.net');
const officialBusinessSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
const OfficialBusinessDeclaration = mongoose_1.default.model("OfficialBusinessDeclaration", officialBusinessSchema);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const id = req.params.id;
        const dir = `./public/uploads/documents/${id}`;
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});
app.get("/api/official-business", (req, res) => {
    try {
        const filter = {};
        if (req.query.employeeNumber)
            filter.employeeNumber = req.query.employeeNumber;
        if (req.query.identityCardNo)
            filter.identityCardNo = req.query.identityCardNo;
        if (req.query.positionGrade)
            filter.positionGrade = req.query.positionGrade;
        if (req.query.status)
            filter.recordStatus = req.query.status;
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
    }
    catch (error) {
        console.error("Error fetching declarations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.get("/api/official-business/:id", (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("Error creating declaration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.put("/api/official-business/:id", (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        OfficialBusinessDeclaration.findByIdAndUpdate(req.params.id, {
            ...req.body,
            updateDateTime: new Date(),
        }, { new: true, runValidators: true })
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
    }
    catch (error) {
        console.error("Error updating declaration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.delete("/api/official-business/:id", (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
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
    }
    catch (error) {
        console.error("Error deleting declaration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.post("/api/official-business/:id/documents", upload.single("document"), (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
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
            if (!updatedDeclaration)
                return;
            const documentPath = `/uploads/documents/${req.params.id}/${req.file?.filename}`;
            res.json({ documentUrl: documentPath });
        })
            .catch((error) => {
            console.error("Error uploading document:", error);
            res.status(500).json({ message: "Internal server error" });
        });
    }
    catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
