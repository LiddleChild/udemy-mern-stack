const { Router } = require("express");
const { check } = require("express-validator");

const placeController = require("../controllers/places-controller");
const fileUpload = require("../middleware/file-upload");

const router = Router();

router.get("/:pid", placeController.getPlaceByID);
router.get("/user/:uid", placeController.getPlacesByUserID);

router.post("/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty() 
  ],
  placeController.createPlace
);

router.patch("/:pid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 })
  ],
  placeController.updatePlace
);

router.delete("/:pid", placeController.deletePlace);

module.exports = router;