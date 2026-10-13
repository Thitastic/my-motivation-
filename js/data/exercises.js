import { groupSlug } from "../i18n.js";

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps and Triceps",
  "Abs and Core",
  "Legs and Glutes",
  "Full Body",
  "Mobility and Stretching"
];

export const muscleGroupImages = {
  abs: "assets/images/abdominal.png",
  back: "assets/images/back.png",
  chest: "assets/images/chest.png",
  shoulders: "assets/images/shoulder.png",
  legs: "assets/images/thigh.png"
};

export const muscleGroupImageKeys = {
  Chest: "chest",
  Back: "back",
  Shoulders: "shoulders",
  "Abs and Core": "abs",
  "Legs and Glutes": "legs"
};

export function getMuscleGroupImage(group) {
  return muscleGroupImages[muscleGroupImageKeys[group]] || "";
}

export const EQUIPMENT = [
  "None",
  "Yoga mat",
  "Chair",
  "Resistance band",
  "Pull-up bar",
  "Parallettes"
];

const art = {
  "Chest": "assets/illustrations/chest.svg",
  "Back": "assets/illustrations/back.svg",
  "Shoulders": "assets/illustrations/shoulders.svg",
  "Biceps and Triceps": "assets/illustrations/arms.svg",
  "Abs and Core": "assets/illustrations/core.svg",
  "Legs and Glutes": "assets/illustrations/legs.svg",
  "Full Body": "assets/illustrations/full-body.svg",
  "Mobility and Stretching": "assets/illustrations/mobility.svg"
};

const verifiedMedia = {
  "pike-push-up": {
    type: "image",
    src: "assets/exercises/shoulders/pike-push-up-thumb.png",
    thumbnail: "assets/exercises/shoulders/pike-push-up-thumb.png",
    sourceUrl: "https://wger.de/media/exercise-images/454/447f3c17-405f-46e0-b138-65c2a8caaab0.png",
    author: "Nash",
    license: "CC-BY-SA 4",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
  },
  crunch: {
    type: "image",
    src: "assets/exercises/core/crunch.png",
    thumbnail: "assets/exercises/core/crunch-thumb.png",
    sourceUrl: "https://wger.de/media/exercise-images/91/Crunches-1.png",
    author: "wger.de",
    license: "CC-BY-SA 3",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.en"
  },
  plank: {
    type: "image",
    src: "assets/exercises/core/plank.png",
    thumbnail: "assets/exercises/core/plank-thumb.png",
    sourceUrl: "https://wger.de/media/exercise-images/458/b7bd9c28-9f1d-4647-bd17-ab6a3adf5770.png",
    author: "utkb",
    license: "CC-BY-SA 4",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
  },
  "reverse-lunge": {
    type: "image",
    src: "assets/exercises/legs/reverse-lunge.jfif",
    thumbnail: "assets/exercises/legs/reverse-lunge-thumb.jpg",
    sourceUrl: "https://wger.de/media/exercise-images/999/d0931eb3-8db0-4049-bb08-aa4036072056.jfif",
    author: "philip",
    license: "CC-BY-SA 4",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
  },
  "pull-up": {
    type: "image",
    src: "assets/exercises/back/pull-up.jpg",
    thumbnail: "assets/exercises/back/pull-up-thumb.jpg",
    sourceUrl: "https://wger.de/media/exercise-images/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg",
    author: "Imobard",
    license: "CC-BY-SA 4",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
  },
  "leg-raise": {
    type: "image",
    src: "assets/exercises/core/leg-raise.png",
    thumbnail: "assets/exercises/core/leg-raise-thumb.png",
    sourceUrl: "https://wger.de/media/exercise-images/125/Leg-raises-2.png",
    author: "Everkinetic",
    license: "CC-BY-SA 3",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.en"
  },
  "hip-flexor-stretch": {
    type: "image",
    src: "assets/exercises/mobility/hip-flexor-stretch-thumb.png",
    thumbnail: "assets/exercises/mobility/hip-flexor-stretch-thumb.png",
    sourceUrl: "https://wger.de/media/exercise-images/1867/767631e5-10d2-46b8-b03f-cc298f96963b.png",
    author: "Davidgj32",
    license: "CC-BY-SA 4",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
  }
};

function mediaFor(id, group) {
  return verifiedMedia[id] || {
    type: "missing",
    src: "",
    thumbnail: "",
    fallback: art[group],
    sourceUrl: "",
    author: "",
    license: "",
    note: "missing-verified-media"
  };
}

function ex(id, name, originalName, group, difficulty, equipment, target, sets, rest, description, instructions, mistakes, safety, easier, harder) {
  return {
    id,
    name,
    originalName,
    description,
    muscleGroup: groupSlug(group),
    muscleGroups: [group],
    difficulty,
    equipment,
    instructions,
    commonMistakes: mistakes,
    mistakes,
    safetyTips: safety,
    target,
    recommendedSets: sets,
    restSeconds: rest,
    easier,
    harder,
    illustration: art[group],
    media: mediaFor(id, group)
  };
}

export const EXERCISES = [
  ex("wall-push-up", "Chống đẩy tường", "Wall Push-Up", "Chest", 1, ["None"], "10-15 lần", 2, 35, "Biến thể chống đẩy nhẹ giúp làm quen động tác đẩy với áp lực thấp lên khớp.", ["Đứng cách tường khoảng một sải tay.", "Siết nhẹ cơ bụng, giữ thân người thành một đường thẳng từ đầu đến gót.", "Gập khuỷu tay để hạ người về phía tường, rồi đẩy người trở lại."], ["Nhún vai lên tai", "Để hông võng xuống", "Bật người khỏi tường quá nhanh"], ["Dùng bức tường chắc chắn và bước gần hơn nếu cổ tay hoặc vai bị căng."], null, "incline-push-up"),
  ex("incline-push-up", "Chống đẩy nghiêng", "Incline Push-Up", "Chest", 2, ["Chair"], "8-12 lần", 3, 45, "Chống đẩy đặt tay cao, là cầu nối giữa chống đẩy tường và chống đẩy sàn.", ["Đặt tay lên bề mặt chắc chắn cao khoảng ngang hông.", "Giữ khuỷu tay chếch khoảng 45 độ so với thân.", "Hạ ngực chạm nhẹ mép bề mặt rồi đẩy lên."], ["Dùng ghế nhẹ, dễ trượt", "Xòe khuỷu tay quá rộng", "Tập biên độ quá ngắn"], ["Ưu tiên mặt bàn cố định hoặc bệ nặng, không dùng đồ nội thất dễ lật."], "wall-push-up", "knee-push-up"),
  ex("knee-push-up", "Chống đẩy gối", "Knee Push-Up", "Chest", 2, ["Yoga mat"], "8-14 lần", 3, 45, "Biến thể chống đẩy sàn giảm tải trọng cơ thể.", ["Đặt gối trên thảm, hai tay dưới vai.", "Siết mông và giữ đường thẳng từ vai đến gối.", "Hạ người có kiểm soát rồi đẩy sàn ra xa."], ["Đẩy hông ra sau vai", "Cúi đầu xuống", "Tập nửa biên độ"], ["Đệm gối và dừng lại nếu cổ tay đau."], "incline-push-up", "push-up"),
  ex("push-up", "Chống đẩy chuẩn", "Standard Push-Up", "Chest", 3, ["None"], "6-12 lần", 3, 60, "Động tác đẩy ngang nền tảng cho ngực, tay sau và core.", ["Bắt đầu ở tư thế plank cao.", "Hạ ngực về gần sàn, khuỷu tay đi chéo về sau.", "Đẩy lên mà vẫn giữ thân người căng chắc."], ["Võng hông", "Đặt tay quá xa phía trước", "Rướn cổ"], ["Kê tay cao hơn nếu mất form trước khi đạt số lần mục tiêu."], "knee-push-up", "diamond-push-up"),
  ex("diamond-push-up", "Chống đẩy kim cương", "Diamond Push-Up", "Chest", 4, ["None"], "5-10 lần", 3, 75, "Biến thể đặt tay hẹp, nhấn mạnh tay sau và phần trong ngực.", ["Đặt hai tay gần nhau sao cho ngón cái và trỏ gần chạm nhau.", "Siết thân người và hạ xuống chậm.", "Đẩy lên qua toàn bộ lòng bàn tay."], ["Sụp vai", "Xòe khuỷu tay hết cỡ", "Ép cổ tay ở góc đau"], ["Mở tay rộng hơn một chút nếu cổ tay hoặc khuỷu bị kẹt."], "push-up", "archer-push-up"),
  ex("archer-push-up", "Chống đẩy cung thủ", "Archer Push-Up", "Chest", 5, ["None"], "3-6 lần mỗi bên", 4, 90, "Biến thể chống đẩy một bên nâng cao.", ["Đặt tay rộng hơn vai.", "Dồn người sang một tay khi hạ xuống, tay còn lại gần như duỗi dài.", "Đẩy về giữa trước khi đổi bên."], ["Đổ sụp vào vai", "Chuyển trọng tâm quá nhanh", "Hông lệch"], ["Hãy tích lũy số lần chống đẩy chuẩn và kim cương trước."], "diamond-push-up", null),

  ex("reverse-snow-angel", "Thiên thần tuyết úp người", "Reverse Snow Angel", "Back", 1, ["Yoga mat"], "30 giây", 2, 35, "Bài kích hoạt lưng khi nằm sấp, giúp cải thiện tư thế và kiểm soát vai.", ["Nằm sấp, hai tay đặt dọc thân.", "Nâng tay nhẹ khỏi sàn và quét tay lên quá đầu.", "Di chuyển chậm, chủ động kéo bả vai."], ["Ngẩng cằm cao", "Vung tay quá nhanh", "Ưỡn lưng dưới quá mức"], ["Giữ trán gần thảm và dừng nếu vai bị kẹt."], null, "superman"),
  ex("superman", "Superman", "Superman", "Back", 2, ["Yoga mat"], "8-12 lần", 3, 45, "Bài tập chuỗi sau giúp tăng sức bền lưng và duỗi hông.", ["Nằm sấp, hai tay duỗi dài.", "Nâng tay và chân nhẹ nhàng trong khi siết mông.", "Giữ ngắn rồi hạ xuống có kiểm soát."], ["Giật mạnh lên", "Nín thở", "Ưỡn cổ quá mức"], ["Nâng thấp, không đau và không cố quá biên độ."], "reverse-snow-angel", "band-row"),
  ex("band-row", "Kéo dây kháng lực", "Band Row", "Back", 2, ["Resistance band"], "10-15 lần", 3, 50, "Bài kéo cơ bản dùng dây kháng lực và điểm neo chắc.", ["Neo dây ngang ngực.", "Kéo khuỷu tay ra sau và siết hai bả vai.", "Trả tay thẳng ra mà vẫn giữ tư thế tốt."], ["Nhún vai", "Ngả người để ăn gian", "Neo dây không chắc"], ["Dùng điểm neo chắc và kiểm tra dây trước khi tập."], "superman", "assisted-pull-up"),
  ex("assisted-pull-up", "Kéo xà có hỗ trợ", "Assisted Pull-Up", "Back", 4, ["Pull-up bar", "Resistance band"], "3-8 lần", 4, 90, "Bước tiến tới kéo xà bằng dây hỗ trợ.", ["Móc dây an toàn vào xà đơn.", "Bắt đầu từ tư thế treo có kiểm soát.", "Kéo ngực về phía xà rồi hạ xuống chậm."], ["Nhảy vào từng lần", "Không kiểm soát pha hạ", "Thả lỏng vai"], ["Chỉ dùng xà lắp đúng chuẩn và bước xuống nếu mất lực bám."], "band-row", "pull-up"),
  ex("pull-up", "Kéo xà", "Pull-Up", "Back", 5, ["Pull-up bar"], "2-8 lần", 4, 120, "Bài kéo dọc nghiêm ngặt cho lưng và tay nâng cao.", ["Treo người với hai tay hơi rộng hơn vai.", "Kéo khuỷu tay xuống về phía sườn.", "Hạ xuống hết biên độ trong kiểm soát."], ["Đánh đà", "Tập nửa biên độ", "Rướn cổ lên xà"], ["Chỉ dùng xà chịu lực được lắp theo hướng dẫn của nhà sản xuất."], "assisted-pull-up", null),

  ex("arm-circles", "Xoay tay vòng tròn", "Arm Circles", "Shoulders", 1, ["None"], "40 giây", 2, 30, "Bài khởi động vai nhẹ giúp tăng kiểm soát và lưu thông máu.", ["Đứng thẳng, duỗi hai tay sang ngang.", "Vẽ vòng tròn nhỏ về trước rồi về sau.", "Giữ xương sườn chồng trên hông."], ["Di chuyển quá nhanh", "Nhún vai", "Ưỡn ngực quá mức"], ["Giữ vòng tròn nhỏ và không đau ở giai đoạn đầu."], null, "pike-push-up"),
  ex("pike-push-up", "Chống đẩy Pike", "Pike Push-Up", "Shoulders", 3, ["Yoga mat"], "5-10 lần", 3, 75, "Chống đẩy thân chữ V, phát triển sức mạnh đẩy qua đầu.", ["Bắt đầu với hông nâng cao, thân tạo hình chữ V ngược.", "Gập khuỷu tay, hạ đỉnh đầu về gần sàn.", "Đẩy trở lại trong khi giữ hông cao."], ["Biến thành chống đẩy thường", "Xòe khuỷu tay", "Thả đầu xuống sàn"], ["Dùng thảm mềm và dừng trước khi đầu chạm mạnh."], "arm-circles", "elevated-pike-push-up"),
  ex("elevated-pike-push-up", "Chống đẩy Pike kê chân", "Elevated Pike Push-Up", "Shoulders", 4, ["Chair"], "4-8 lần", 4, 90, "Biến thể Pike khó hơn với chân đặt cao.", ["Đặt chân lên bệ thấp, chắc chắn.", "Giữ tay bám sàn và hông nâng cao.", "Hạ chậm rồi đẩy mạnh qua sàn."], ["Dùng ghế có bánh xe", "Vội ở đáy động tác", "Mất kiểm soát vai"], ["Dùng bề mặt cố định, chống trượt và không cao quá khả năng kiểm soát."], "pike-push-up", "wall-handstand-hold"),
  ex("wall-handstand-hold", "Giữ trồng chuối tường", "Wall Handstand Hold", "Shoulders", 5, ["None"], "10-30 giây", 4, 120, "Tư thế đảo ngược có kiểm soát cho sức mạnh vai nâng cao.", ["Đi chân lên tường ở khu vực trống để vào tư thế plank đảo ngược.", "Đẩy vai cao và giữ thân chắc.", "Bước xuống trước khi mệt làm mất trục người."], ["Nín thở", "Võng sườn", "Giữ quá lâu"], ["Dùng không gian trống và tránh tập nếu không phù hợp về y tế với tư thế đảo ngược."], "elevated-pike-push-up", null),

  ex("bench-dip", "Nhún tay sau với ghế", "Supported Bench Dip", "Biceps and Triceps", 2, ["Chair"], "8-12 lần", 3, 60, "Bài tay sau dùng mép ghế chắc và biên độ vừa phải.", ["Ngồi ở mép ghế hoặc bệ chắc.", "Đặt tay cạnh hông, chân đủ gần để kiểm soát.", "Hạ xuống một đoạn ngắn rồi đẩy lên."], ["Dùng ghế không ổn định", "Đổ vai ra trước", "Hạ quá sâu"], ["Dùng bề mặt cố định và giữ biên độ thoải mái cho vai."], null, "diamond-push-up"),
  ex("band-curl", "Cuốn tay trước với dây", "Band Curl", "Biceps and Triceps", 2, ["Resistance band"], "10-15 lần", 3, 45, "Bài tay trước đơn giản với dây kháng lực.", ["Đứng lên giữa dây.", "Giữ khuỷu tay sát hai bên thân.", "Cuốn tay lên mà không ngả người ra sau."], ["Đung đưa người", "Khuỷu tay trôi ra trước", "Dây đặt lỏng dưới chân"], ["Giữ dây nằm giữa hai bàn chân."], null, "chin-up-negative"),
  ex("triceps-extension", "Duỗi tay sau với dây", "Band Triceps Extension", "Biceps and Triceps", 3, ["Resistance band"], "10-14 lần", 3, 50, "Bài dùng dây để phát triển lực khóa khuỷu tay của tay sau.", ["Neo dây phía trên hoặc sau lưng.", "Giữ khuỷu tay cố định.", "Duỗi tay rồi trả về chậm."], ["Khuỷu tay di chuyển", "Ưỡn lưng", "Để dây bật nhanh"], ["Dùng điểm neo chắc và nhịp chuyển động mượt."], "bench-dip", "diamond-push-up"),
  ex("chin-up-negative", "Hạ người Chin-Up chậm", "Chin-Up Negative", "Biceps and Triceps", 4, ["Pull-up bar"], "3-5 lần chậm", 4, 100, "Bài hạ người có kiểm soát để xây lực kéo xà.", ["Bước lên vị trí cằm vượt xà.", "Giữ ngắn với xương sườn hạ xuống.", "Hạ trong 3 đến 5 giây."], ["Thả rơi quá nhanh", "Vai lỏng", "Nhảy từ sàn lên"], ["Dùng bục để lên và xuống an toàn."], "band-curl", "pull-up"),

  ex("dead-bug", "Dead Bug", "Dead Bug", "Abs and Core", 1, ["Yoga mat"], "8-12 lần mỗi bên", 2, 35, "Bài core cho người mới giúp học cách siết bụng mà không căng cột sống.", ["Nằm ngửa, gối nằm trên hông.", "Ép nhẹ lưng dưới xuống sàn.", "Duỗi tay và chân đối diện mà không làm lưng bật lên."], ["Ưỡn lưng dưới", "Duỗi quá xa", "Nín thở"], ["Giảm biên độ nếu lưng dưới rời sàn."], null, "crunch"),
  ex("crunch", "Gập bụng", "Crunch", "Abs and Core", 2, ["Yoga mat"], "10-15 lần", 3, 40, "Bài gập thân có kiểm soát cho cơ bụng.", ["Nằm ngửa, gối gập và bàn chân đặt sàn.", "Cuộn xương sườn về phía xương chậu.", "Hạ vai xuống chậm."], ["Kéo cổ", "Bật người nhanh", "Tập biên độ quá lớn"], ["Đỡ đầu nhẹ và dừng nếu cổ đau."], "dead-bug", "plank"),
  ex("plank", "Plank (giữ thân thẳng)", "Plank", "Abs and Core", 2, ["Yoga mat"], "20-45 giây", 3, 45, "Bài giữ core chống ưỡn lưng, tạo căng toàn thân.", ["Đặt khuỷu tay dưới vai.", "Siết mông và kéo xương sườn xuống.", "Giữ thân thẳng trong khi vẫn thở đều."], ["Võng hông", "Đẩy mông quá cao", "Nín thở"], ["Hạ gối xuống nếu lưng dưới bắt đầu chịu lực."], "dead-bug", "hollow-body-hold"),
  ex("hollow-body-hold", "Giữ Hollow Body", "Hollow Body Hold", "Abs and Core", 4, ["Yoga mat"], "10-30 giây", 4, 75, "Tư thế core kiểu thể dục dụng cụ giúp tăng sức mạnh chuỗi trước.", ["Nằm ngửa và ép lưng dưới xuống sàn.", "Nâng vai và chân thành đường cong nông.", "Vươn tay dài nhưng không để lưng bật lên."], ["Lưng dưới cong", "Căng cổ", "Bắt đầu với chân quá thấp"], ["Co gối hoặc đưa tay về trước để giảm độ khó."], "plank", "leg-raise"),
  ex("leg-raise", "Nâng chân nằm", "Leg Raise", "Abs and Core", 4, ["Yoga mat"], "6-12 lần", 4, 75, "Bài core phần dưới đòi hỏi kiểm soát xương chậu.", ["Nằm thẳng và siết bụng.", "Nâng chân lên không dùng đà.", "Hạ chân chỉ đến mức lưng vẫn áp sàn."], ["Ưỡn lưng dưới", "Dùng quán tính", "Thả rơi chân"], ["Giới hạn biên độ dưới và co gối nếu cần."], "hollow-body-hold", "l-sit"),
  ex("l-sit", "L-Sit", "L-Sit", "Abs and Core", 5, ["Parallettes"], "5-20 giây", 5, 120, "Tư thế giữ nâng cao cho core, vai và cơ gập hông.", ["Ấn mạnh xuống xà kép thấp.", "Khóa khuỷu tay và nâng hông.", "Duỗi chân trong phạm vi bạn vẫn kiểm soát được."], ["Nhún vai", "Gập khuỷu", "Ép duỗi chân quá sớm"], ["Bắt đầu bằng tuck hold và dùng xà kép thấp chắc chắn."], "leg-raise", null),

  ex("chair-squat", "Ngồi xổm chạm ghế", "Chair Squat", "Legs and Glutes", 1, ["Chair"], "10-15 lần", 2, 45, "Mẫu squat có ghế hỗ trợ cho người mới.", ["Đứng trước ghế chắc chắn.", "Đẩy hông ra sau đến khi chạm nhẹ ghế.", "Đứng lên bằng cách đạp sàn."], ["Ngồi phịch xuống ghế", "Gối đổ vào trong", "Nhấc gót"], ["Dùng ghế chắc, không trượt."], null, "squat"),
  ex("squat", "Ngồi xổm", "Squat", "Legs and Glutes", 2, ["None"], "10-20 lần", 3, 55, "Động tác thân dưới nền tảng.", ["Đứng hai chân rộng khoảng vai.", "Ngồi xuống giữa hai hông, ngực mở.", "Đứng thẳng lên và siết mông."], ["Gối sụp vào trong", "Nhấc gót", "Gập thân quá mức"], ["Quay lại squat chạm ghế nếu xuống sâu bị đau."], "chair-squat", "reverse-lunge"),
  ex("reverse-lunge", "Chùng chân lùi", "Reverse Lunge", "Legs and Glutes", 3, ["None"], "8-12 lần mỗi chân", 3, 60, "Bài một chân thân thiện với gối.", ["Bước một chân ra sau đủ dài.", "Hạ xuống đến khi hai gối gập thoải mái.", "Đạp qua bàn chân trước để đứng lên."], ["Bước quá ngắn", "Gối trước đổ vào trong", "Đẩy quá nhiều bằng mũi chân sau"], ["Có thể chạm nhẹ tường để giữ thăng bằng."], "squat", "split-squat"),
  ex("split-squat", "Split Squat", "Split Squat", "Legs and Glutes", 3, ["None"], "8-12 lần mỗi chân", 3, 65, "Bài một chân cố định để xây sức mạnh.", ["Đặt hai chân trước sau đủ dài.", "Hạ người thẳng xuống có kiểm soát.", "Giữ bàn chân trước bám hoàn toàn xuống sàn."], ["Đổ người quá xa về trước", "Bàn chân sau xoay lệch", "Tập quá vội"], ["Giảm độ sâu nếu gối khó chịu."], "reverse-lunge", "assisted-pistol-squat"),
  ex("assisted-pistol-squat", "Pistol Squat có hỗ trợ", "Assisted Pistol Squat", "Legs and Glutes", 5, ["Pull-up bar"], "3-6 lần mỗi chân", 5, 120, "Squat một chân có hỗ trợ cho khả năng kiểm soát nâng cao.", ["Nắm một điểm tựa thẳng đứng chắc chắn.", "Duỗi một chân ra trước.", "Hạ xuống với hỗ trợ vừa đủ rồi đứng lên có kiểm soát."], ["Kéo mạnh bằng tay", "Gối đổ vào trong", "Ép xuống sâu quá khả năng"], ["Dùng điểm tựa chắc và dừng ở độ sâu kiểm soát được."], "split-squat", null),

  ex("marching-bridge", "Cầu mông nâng chân luân phiên", "Marching Bridge", "Full Body", 2, ["Yoga mat"], "8-12 lần mỗi bên", 3, 45, "Biến thể cầu mông thử thách ổn định core.", ["Nâng hông lên, giữ xương sườn hạ.", "Nhấc một bàn chân mà không xoay hông.", "Đổi bên chậm rãi."], ["Hông rơi xuống", "Ưỡn lưng", "Đổi chân quá nhanh"], ["Giữ biên độ nhỏ và không đau."], null, "bear-crawl"),
  ex("bear-crawl", "Bò gấu", "Bear Crawl", "Full Body", 3, ["None"], "20-40 giây", 3, 60, "Mẫu bò giúp tập vai, core và chân.", ["Bắt đầu bằng hai tay và mũi chân, gối lơ lửng.", "Di chuyển tay và chân đối diện cùng lúc.", "Giữ hông thấp và ổn định."], ["Hông quá cao", "Bước quá lớn và ồn", "Vai sụp"], ["Dùng sàn trống, không trơn."], "marching-bridge", "burpee-step-back"),
  ex("burpee-step-back", "Burpee bước lùi", "Step-Back Burpee", "Full Body", 3, ["None"], "6-10 lần", 3, 75, "Biến thể burpee ít va chạm, không bật nhảy.", ["Squat xuống và đặt tay lên sàn.", "Bước chân ra sau vào plank rồi bước lên lại.", "Đứng thẳng và đặt lại tư thế."], ["Sụp vào plank", "Làm quá vội", "Nín thở"], ["Bước thay vì nhảy và kê tay cao nếu cần."], "bear-crawl", "mountain-climber"),
  ex("mountain-climber", "Leo núi tại chỗ", "Mountain Climber", "Full Body", 3, ["None"], "30-45 giây", 3, 60, "Bài plank động cho sức bền.", ["Giữ plank chắc.", "Đưa từng gối về trước luân phiên.", "Giữ vai nằm trên tay."], ["Hông nảy lên xuống", "Tay đặt quá xa trước vai", "Mất tư thế plank"], ["Giảm tốc độ trước khi form xấu đi."], "bear-crawl", "burpee"),
  ex("burpee", "Burpee", "Burpee", "Full Body", 4, ["None"], "5-10 lần", 4, 90, "Động tác toàn thân cho thể lực.", ["Squat xuống, đặt tay, bước hoặc bật chân ra plank.", "Đưa chân về dưới hông.", "Đứng lên hoặc bật nhảy có kiểm soát."], ["Thả người xuống sàn", "Tiếp đất cứng", "Đua tốc độ làm mất form"], ["Dùng burpee bước lùi nếu va chạm hoặc mệt làm xấu kỹ thuật."], "burpee-step-back", null),

  ex("cat-cow", "Cat-Cow", "Cat-Cow", "Mobility and Stretching", 1, ["Yoga mat"], "45 giây", 1, 15, "Bài linh hoạt cột sống nhẹ nhàng.", ["Chống tay và gối trên thảm.", "Cong lưng lên chậm.", "Ưỡn nhẹ và thở ra để thả lỏng căng thẳng."], ["Ép đến cuối biên độ", "Khóa cứng khuỷu", "Di chuyển quá nhanh"], ["Giữ chuyển động êm và thoải mái."], null, "worlds-greatest-stretch"),
  ex("hip-flexor-stretch", "Giãn cơ gập hông", "Hip Flexor Stretch", "Mobility and Stretching", 1, ["Yoga mat"], "30 giây mỗi bên", 1, 15, "Bài quỳ giãn cơ gập hông.", ["Quỳ một gối, chân còn lại đặt trước.", "Thu nhẹ xương chậu.", "Dịch người về trước đến khi cảm thấy căng ở hông chân sau."], ["Ưỡn lưng dưới", "Đẩy vào cảm giác đau", "Để gối khó chịu"], ["Đệm gối sau và giữ mức căng nhẹ."], null, "worlds-greatest-stretch"),
  ex("worlds-greatest-stretch", "Giãn cơ lunge xoay người", "World's Greatest Stretch", "Mobility and Stretching", 2, ["Yoga mat"], "4-6 lần mỗi bên", 2, 20, "Bài giãn động cho hông, gân kheo và xoay thân.", ["Bước vào tư thế lunge dài.", "Đặt hai tay vào bên trong bàn chân trước.", "Xoay ngực về phía chân trước rồi đổi bên."], ["Bước quá ngắn", "Ép xoay quá mức", "Thả hông không kiểm soát"], ["Kê tay cao nếu sàn quá xa."], "hip-flexor-stretch", "deep-squat-hold"),
  ex("deep-squat-hold", "Giữ squat sâu", "Deep Squat Hold", "Mobility and Stretching", 3, ["None"], "20-60 giây", 2, 30, "Tư thế giữ squat để mở cổ chân, hông và cải thiện tư thế.", ["Đặt chân hơi rộng hơn hông.", "Ngồi xuống chỉ đến mức gót vẫn chạm sàn.", "Dùng khuỷu tay đẩy nhẹ gối ra và thở đều."], ["Ép xuống quá sâu", "Nhấc gót", "Gù lưng gây khó chịu"], ["Có thể nắm khung cửa để hỗ trợ thăng bằng."], "worlds-greatest-stretch", null)
];

export const EXERCISE_MAP = Object.fromEntries(EXERCISES.map((exercise) => [exercise.id, exercise]));

export const PROGRESSION_PATHS = [
  { id: "push-up-path", name: "Sức mạnh chống đẩy", group: "Chest", nodes: ["wall-push-up", "incline-push-up", "knee-push-up", "push-up", "diamond-push-up", "archer-push-up"] },
  { id: "pull-up-path", name: "Sức mạnh kéo", group: "Back", nodes: ["reverse-snow-angel", "superman", "band-row", "assisted-pull-up", "pull-up"] },
  { id: "core-path", name: "Kiểm soát core", group: "Abs and Core", nodes: ["dead-bug", "plank", "hollow-body-hold", "leg-raise", "l-sit"] },
  { id: "leg-path", name: "Sức mạnh một chân", group: "Legs and Glutes", nodes: ["chair-squat", "squat", "reverse-lunge", "split-squat", "assisted-pistol-squat"] },
  { id: "shoulder-path", name: "Kiểm soát đẩy qua đầu", group: "Shoulders", nodes: ["arm-circles", "pike-push-up", "elevated-pike-push-up", "wall-handstand-hold"] }
];

export function getExercise(id) {
  return EXERCISE_MAP[id];
}

export function exercisesByGroup(group) {
  return EXERCISES.filter((exercise) => exercise.muscleGroups.includes(group));
}
