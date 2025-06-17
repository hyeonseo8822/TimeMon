const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5000;


app.use(cors());
app.use(express.json());

const path = require('path');

const userFilePath = path.join(__dirname, 'public', 'data', 'user.json');
const dailyLogsPath = path.join(__dirname, 'public', 'data', 'dailyLogs.json');

app.post('/signup', (req, res) => {
  const { userId, password, email } = req.body;

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    const users = data ? JSON.parse(data) : [];

    const lastId = users.length > 0 ? parseInt(users[users.length - 1].id) : 0;
    const newId = lastId + 1;

    const newUser = {
      id: newId.toString(),
      userId,
      password,
      email,
      profileImage: "profile.svg",
      selectedCharacter: "lemon",
      unlockedCharacters: ["lemon"],
      _lastUnlockCount: 0
    };

    users.push(newUser);

    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).send('저장 실패');
      res.send('저장 성공');
    });
  });
});

app.post('/login', (req, res) => {
  const { userId, password } = req.body;
  fs.readFile(userFilePath, 'utf8', (err, data) => {
    const users = data ? JSON.parse(data) : [];
    const user = users.find(u => u.userId === userId && u.password === password);

    if (user) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});
function addGoal(userId, newGoal) {
  let dailyLogs = [];

  if (fs.existsSync(dailyLogsPath)) {
    const data = fs.readFileSync(dailyLogsPath, 'utf-8');
    dailyLogs = JSON.parse(data);
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;

  let todayLog = dailyLogs.find(log => log.userId === userId && log.date === today);
  if (todayLog) {
    todayLog.goals.push(newGoal);
  } else {
    todayLog = {
      userId,
      date: today,
      goals: [newGoal],
      freeStudyTime: 0,
      totalStudyTime: 0
    };
    dailyLogs.push(todayLog);
  }

  fs.writeFileSync(dailyLogsPath, JSON.stringify(dailyLogs, null, 2));
}

app.post('/addgoal', (req, res) => {
  console.log('POST /addgoal 요청 받음:', req.body);
  const { userId, goal } = req.body;
  addGoal(userId, goal);
  res.status(200).json({ message: 'Goal saved' });
});

app.post('/update-user', (req, res) => {
  const { userId, selectedCharacter, unlockedCharacters } = req.body;
  const userFilePath = path.join(__dirname, 'public', 'data', 'user.json');

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('읽기 오류');

    let users = JSON.parse(data);
    const userIndex = users.findIndex(user => user.userId === userId);

    if (userIndex === -1) {
      return res.status(404).send('사용자 없음');
    }

    users[userIndex].selectedCharacter = selectedCharacter;
    if (unlockedCharacters) {
      users[userIndex].unlockedCharacters = unlockedCharacters;
    }

    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).send('쓰기 오류');
      res.send('업데이트 성공');
    });
  });
});


app.post('/deletegoal', (req, res) => {
  const { userId, goalId } = req.body;

  if (!userId || !goalId) {
    return res.status(400).json({ message: 'userId와 goalId가 필요합니다.' });
  }

  let dailyLogs = [];
  try {
    const data = fs.readFileSync(dailyLogsPath, 'utf-8');
    dailyLogs = JSON.parse(data);
  } catch (err) {
    return res.status(500).json({ message: '파일 읽기 오류', error: err.message });
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;

  const userLog = dailyLogs.find(log => log.userId === userId && log.date === today);

  if (!userLog) {
    return res.status(404).json({ message: '해당 날짜의 로그가 없습니다.' });
  }

  const originalLength = userLog.goals.length;
  userLog.goals = userLog.goals.filter(goal => String(goal.id) !== String(goalId));

  if (userLog.goals.length === originalLength) {
    return res.status(404).json({ message: 'goalId에 해당하는 목표가 없습니다.' });
  }

  // 삭제가 된 상태이므로 파일에 다시 저장
  fs.writeFileSync(dailyLogsPath, JSON.stringify(dailyLogs, null, 2));

  return res.status(200).json({ message: '목표가 삭제되었습니다.' });
});

app.post('/updateStudyTime', (req, res) => {
  const { userId, date, additionalTime } = req.body;
  fs.readFile(dailyLogsPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('파일 읽기 오류:', err);
      return res.status(500).json({ message: '파일 읽기 오류' });
    }

    let logs = [];
    try {
      logs = JSON.parse(data);
    } catch (parseErr) {
      console.error('JSON 파싱 오류:', parseErr);
      return res.status(500).json({ message: 'JSON 파싱 오류' });
    }

    const logIndex = logs.findIndex(log => log.userId === userId && log.date === date);

    if (logIndex !== -1) {
      logs[logIndex].totalStudyTime += additionalTime;
    } else {
      logs.push({
        userId,
        date,
        totalStudyTime: additionalTime,
        goals: []
      });
    }

    fs.writeFile(dailyLogsPath, JSON.stringify(logs, null, 2), 'utf-8', writeErr => {
      if (writeErr) {
        console.error('파일 저장 오류:', writeErr);
        return res.status(500).json({ message: '파일 저장 오류' });
      }

      return res.json({ message: '공부 시간 업데이트 완료', updatedLog: logs[logIndex] || logs[logs.length - 1] });
    });
  });
});
app.post('/update-userid', (req, res) => {
  const { oldUserId, newUserId } = req.body;

  if (!oldUserId || !newUserId) {
    return res.status(400).send('oldUserId와 newUserId를 모두 보내주세요.');
  }

  fs.readFile(userFilePath, 'utf8', (err, userData) => {
    if (err) return res.status(500).send('user.json 파일 읽기 오류');

    let users;
    try {
      users = JSON.parse(userData);
    } catch (parseErr) {
      console.error(parseErr);
      return res.status(500).send('user.json JSON 파싱 오류');
    }

    const userIndex = users.findIndex(user => user.userId === oldUserId);
    if (userIndex === -1) return res.status(404).send('사용자를 찾을 수 없습니다.');

    const duplicate = users.find(user => user.userId === newUserId);
    if (duplicate) return res.status(409).send('이미 존재하는 userId입니다.');

    // userId 변경
    users[userIndex].userId = newUserId;

    // user.json 쓰기
    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).send('user.json 파일 쓰기 오류');

      fs.readFile(dailyLogsPath, 'utf8', (err, logData) => {
        if (err) return res.status(500).send('dailyLogs.json 파일 읽기 오류');

        let logs;
        try {
          logs = JSON.parse(logData);
        } catch (parseErr) {
          console.error(parseErr);
          return res.status(500).send('dailyLogs.json JSON 파싱 오류');
        }

        logs = logs.map(log => {
          if (log.userId === oldUserId) {
            return { ...log, userId: newUserId };
          }
          return log;
        });

        fs.writeFile(dailyLogsPath, JSON.stringify(logs, null, 2), 'utf8', (err) => {
          if (err) return res.status(500).send('dailyLogs.json 파일 쓰기 오류');

          res.send('userId가 성공적으로 변경되고, dailyLogs도 업데이트되었습니다.');
        });
      });
    });
  });
});

app.post('/update-unlocked', (req, res) => {
  const { userId, unlockedCharacters, _lastUnlockCount } = req.body;

  if (!userId || !unlockedCharacters) {
    return res.status(400).send('필수 데이터 누락');
  }

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('파일 읽기 오류');

    let users;
    try {
      users = JSON.parse(data);
    } catch {
      return res.status(500).send('JSON 파싱 오류');
    }

    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex === -1) return res.status(404).send('사용자 없음');

    users[userIndex].unlockedCharacters = unlockedCharacters;
    if (_lastUnlockCount !== undefined) {
      users[userIndex]._lastUnlockCount = _lastUnlockCount;
    }

    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).send('파일 쓰기 오류');
      res.send('unlockedCharacters 업데이트 완료');
    });
  });
});


app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중`);
});
