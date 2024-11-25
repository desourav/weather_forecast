import express from "express";
import {getAllData} from '../controllers/controller'
const router = express.Router();

router.route("/")
// GET all weather data
.get(getAllData)

module.exports = router;