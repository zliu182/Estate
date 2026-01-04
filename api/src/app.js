import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory hash-map for staff lookup
const staffHashMap = new Map<string, StaffData>();

// Database Configuration (you'll need to provide your actual config)
const dbConfig: DBConfig = {
  user: process.env.DB_USER || 'your_user',
  password: process.env.DB_PASSWORD || 'your_password',
  connectString: process.env.DB_CONNECT_STRING || 'your_connect_string',
};

// Function to populate staff hash-map
async function populateStaffHashMap(): Promise<void> {
  try {
    const query = 'SELECT staffno, salary, telephone, email FROM dh_staff';
    const result = await executeQuery(query);

    staffHashMap.clear();
    result.rows.forEach((row: any[]) => {
      const [staffno, salary, telephone, email] = row;
      staffHashMap.set(staffno, { salary, telephone, email });
    });

    console.log('Staff hash-map populated successfully!');
  } catch (err) {
    console.error('Error populating staff hash-map:', err);
  }
}

// Function to execute queries
async function executeQuery(
  query: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<QueryResult> {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, binds, options);
    await connection.commit();
    return result as QueryResult;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Main page route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the main page!');
});

// ============================================================
// STAFF ENDPOINTS - POST ONLY
// ============================================================

app.post('/staff', async (req: Request, res: Response) => {
  const { action } = req.body;

  try {
    switch (action) {
      case 'getAll':
        await handleGetAllStaff(req, res);
        break;
      case 'create':
        await handleCreateStaff(req, res);
        break;
      case 'update':
        await handleUpdateStaff(req, res);
        break;
      default:
        res.status(400).json({ message: 'Invalid action. Use: getAll, create, update' });
    }
  } catch (err) {
    console.error('Error in staff endpoint:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function handleGetAllStaff(req: Request, res: Response): Promise<void> {
  const query = 'SELECT * FROM dh_staff';
  const result = await executeQuery(query);

  const columnNames: (keyof StaffRecord)[] = [
    'staff_id',
    'first_name',
    'last_name',
    'position',
    'gender',
    'dob',
    'salary',
    'branch_id',
    'telephone_ext',
    'mobile_number',
    'email',
  ];

  const jsonResult: StaffRecord[] = result.rows.map((row: any[]) => {
    return columnNames.reduce((obj: any, col, index) => {
      obj[col] = row[index];
      return obj;
    }, {} as StaffRecord);
  });

  res.json(jsonResult);
}

async function handleCreateStaff(req: Request, res: Response): Promise<void> {
  const {
    staffno,
    fname,
    lname,
    position,
    sex,
    dob,
    salary,
    branchno,
    telephone,
    mobile,
    email,
  } = req.body;

  // Validate input
  if (
    !staffno ||
    !fname ||
    !lname ||
    !position ||
    !sex ||
    !dob ||
    !salary ||
    !branchno ||
    !telephone ||
    !mobile ||
    !email
  ) {
    res.status(400).send('All fields are required');
    return;
  }

  const newStaff = {
    staffno,
    fname,
    lname,
    position,
    sex,
    dob: new Date(dob),
    salary,
    branchno,
    telephone,
    mobile,
    email,
  };

  try {
    // Check if branchno exists
    const checkBranchQuery = `SELECT branchno FROM dh_branch WHERE branchno = :branchno`;
    const result = await executeQuery(checkBranchQuery, { branchno });

    if (!result || result.rows.length === 0) {
      res.status(400).send('The branch does not exist.');
      return;
    }

    // Insert staff record
    const query = `
      BEGIN
        INSERT INTO dh_staff (
            staffno, fname, lname, position, sex, dob, salary,
            branchno, telephone, mobile, email
        ) VALUES (
            :staffno, :fname, :lname, :position, :sex,
            TO_DATE(:dob, 'YYYY-MM-DD'), :salary,
            :branchno, :telephone, :mobile, :email
        );
        COMMIT;
      END;
    `;

    const binds = {
      staffno,
      fname,
      lname,
      position,
      sex,
      dob: new Date(dob).toISOString().split('T')[0],
      salary: salary || null,
      branchno,
      telephone: telephone || null,
      mobile: mobile || null,
      email: email || null,
    };

    await executeQuery(query, binds);

    res.status(201).json({
      message: 'New staff hired successfully',
      staff: newStaff,
    });
  } catch (err: any) {
    console.error('Error hiring staff:', err.message);

    if (err.message.includes('unique constraint')) {
      res.status(409).send('Staff already exists');
    } else {
      res.status(500).send('Error hiring staff');
    }
  }
}

async function handleUpdateStaff(req: Request, res: Response): Promise<void> {
  const { staffNo, position, salary, telephone, email } = req.body;

  if (!staffNo) {
    res.status(400).send('Staff number is required');
    return;
  }

  if (!staffHashMap.has(staffNo)) {
    res.status(404).send(`Staff number ${staffNo} not found`);
    return;
  }

  const query = `
    BEGIN
      UPDATE dh_staff
      SET
        salary = :p_salary,
        telephone = :p_telephone,
        email = :p_email,
        position = :p_position
      WHERE staffno = :p_staffno;
      COMMIT;
    END;
  `;

  const binds = {
    p_staffno: staffNo,
    p_salary: salary || null,
    p_telephone: telephone || null,
    p_email: email || null,
    p_position: position || null,
  };

  await executeQuery(query, binds);

  // Update in-memory hash-map
  const updatedStaff = staffHashMap.get(staffNo)!;
  if (salary) updatedStaff.salary = salary;
  if (telephone) updatedStaff.telephone = telephone;
  if (email) updatedStaff.email = email;

  staffHashMap.set(staffNo, updatedStaff);

  res.json([updatedStaff]);
}

// ============================================================
// BRANCH ENDPOINTS - POST ONLY
// ============================================================

app.post('/branch', async (req: Request, res: Response) => {
  const { action } = req.body;

  try {
    switch (action) {
      case 'getAll':
        await handleGetAllBranches(req, res);
        break;
      case 'getOne':
        await handleGetOneBranch(req, res);
        break;
      case 'create':
        await handleCreateBranch(req, res);
        break;
      case 'update':
        await handleUpdateBranch(req, res);
        break;
      default:
        res.status(400).json({ message: 'Invalid action. Use: getAll, getOne, create, update' });
    }
  } catch (err) {
    console.error('Error in branch endpoint:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function handleGetAllBranches(req: Request, res: Response): Promise<void> {
  const query = 'SELECT branchno, street, city, postcode FROM dh_branch';
  const result = await executeQuery(query);

  const jsonResult: BranchRecord[] = result.rows.map((row: any[]) => ({
    branch_no: row[0],
    street: row[1],
    city: row[2],
    postal_code: row[3],
  }));

  res.json(jsonResult);
}

async function handleGetOneBranch(req: Request, res: Response): Promise<void> {
  const { branchNo } = req.body;

  if (!branchNo) {
    res.status(400).json({ message: 'Branch number is required' });
    return;
  }

  const checkBranchQuery = `SELECT branchno, street, city, postcode FROM dh_branch WHERE branchno = :branchNo`;

  try {
    const result = await executeQuery(checkBranchQuery, { branchNo });

    if (result.rows.length > 0) {
      const [branch] = result.rows;

      res.status(200).json({
        exists: true,
        branch: {
          branch_no: branch[0],
          street: branch[1],
          city: branch[2],
          postal_code: branch[3],
        },
      });
    } else {
      res.status(404).json({
        exists: false,
        message: 'Branch not found',
      });
    }
  } catch (error: any) {
    console.error('Error fetching branch:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
    });
  }
}

async function handleCreateBranch(req: Request, res: Response): Promise<void> {
  const { branch_no, street, city, postal_code } = req.body;

  if (!branch_no || !street || !city || !postal_code) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const newBranch = {
    branchno: branch_no,
    street,
    city,
    postcode: postal_code,
  };

  try {
    // Check if branch already exists
    const checkBranchQuery = `SELECT branchno FROM dh_branch WHERE branchno = :branchno`;
    const existingBranch = await executeQuery(checkBranchQuery, { branchno: branch_no });

    if (existingBranch && existingBranch.rows.length > 0) {
      res.status(409).json({ message: 'The branch already exists.' });
      return;
    }

    // Insert new branch
    const insertBranchQuery = `
      INSERT INTO dh_branch (branchno, street, city, postcode)
      VALUES (:branchno, :street, :city, :postcode)
    `;

    await executeQuery(insertBranchQuery, newBranch);

    res.status(201).json({
      message: 'New branch created successfully.',
      branch: newBranch,
    });
  } catch (err: any) {
    console.error('Error creating branch:', err);

    if (err.message.includes('unique constraint')) {
      res.status(409).json({ message: 'Branch already exists.' });
      return;
    }

    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}

async function handleUpdateBranch(req: Request, res: Response): Promise<void> {
  const { branchNo: branchno, street, city, postcode } = req.body;

  if (!branchno) {
    res.status(400).send('Branch number is required');
    return;
  }

  try {
    // Check if branch exists
    const checkBranchQuery = `SELECT branchno FROM dh_branch WHERE branchno = :branchno`;
    const checkResult = await executeQuery(checkBranchQuery, { branchno });

    if (checkResult.rows.length === 0) {
      res.status(404).send(`Branch number ${branchno} not found`);
      return;
    }

    // Update branch
    const updateQuery = `
      UPDATE dh_branch
      SET
        street = COALESCE(NULLIF(:p_street, street), street),
        city = COALESCE(NULLIF(:p_city, city), city),
        postcode = COALESCE(NULLIF(:p_postcode, postcode), postcode)
      WHERE branchno = :p_branchno
    `;

    const updateResult = await executeQuery(updateQuery, {
      p_street: street,
      p_city: city,
      p_postcode: postcode,
      p_branchno: branchno,
    });

    if (updateResult.rowsAffected && updateResult.rowsAffected > 0) {
      res.status(200).send('Branch updated successfully');
    } else {
      res.status(500).send('Error updating branch');
    }
  } catch (err) {
    console.error('Error updating branch:', err);
    res.status(500).send('Database error');
  }
}

// ============================================================
// CLIENT ENDPOINTS - POST ONLY
// ============================================================

app.post('/client', async (req: Request, res: Response) => {
  const { action } = req.body;

  try {
    switch (action) {
      case 'getAll':
        await handleGetAllClients(req, res);
        break;
      case 'create':
        await handleCreateClient(req, res);
        break;
      case 'update':
        await handleUpdateClient(req, res);
        break;
      default:
        res.status(400).json({ message: 'Invalid action. Use: getAll, create, update' });
    }
  } catch (err) {
    console.error('Error in client endpoint:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function handleGetAllClients(req: Request, res: Response): Promise<void> {
  const query = 'SELECT clientno, fname, lname, telno, email, preftype, maxrent FROM dh_client';
  const result = await executeQuery(query);

  const columnNames: (keyof ClientRecord)[] = [
    'client_id',
    'first_name',
    'last_name',
    'telephone',
    'email',
    'prefer_type',
    'max_rent',
  ];

  const jsonResult: ClientRecord[] = result.rows.map((row: any[]) => {
    return columnNames.reduce((obj: any, col, index) => {
      obj[col] = row[index];
      return obj;
    }, {} as ClientRecord);
  });

  res.json(jsonResult);
}

async function handleCreateClient(req: Request, res: Response): Promise<void> {
  const { clientNo, fname, lname, telno, street, city, email, preftype, maxrent } = req.body;

  if (!clientNo) {
    res.status(400).send('Client number is required to identify the client');
    return;
  }

  const newClient = {
    clientno: clientNo,
    fname,
    lname,
    telno,
    street,
    city,
    email,
    preftype,
    maxrent,
  };

  try {
    const query = `
      INSERT INTO dh_client (clientno, fname, lname, telno, street, city, email, preftype, maxrent)
      VALUES (:clientno, :fname, :lname, :telno, :street, :city, :email, :preftype, :maxrent)
    `;

    const binds = {
      clientno: clientNo,
      fname: fname || null,
      lname: lname || null,
      telno: telno || null,
      street: street || null,
      city: city || null,
      email: email || null,
      preftype: preftype || null,
      maxrent: maxrent || null,
    };

    await executeQuery(query, binds);

    res.status(201).json({
      message: 'Client inserted successfully into dh_client',
      client: newClient,
    });
  } catch (err: any) {
    console.error('Error inserting client:', err);
    res.status(500).send(`Error inserting client: ${err.message}`);
  }
}

async function handleUpdateClient(req: Request, res: Response): Promise<void> {
  const { clientno, fname, lname, telno, email, preftype, maxrent } = req.body;

  if (!clientno) {
    res.status(400).send('Client ID is required');
    return;
  }

  try {
    // Check if client exists
    const checkClientQuery = `SELECT clientno FROM dh_client WHERE clientno = :p_clientNo`;
    const checkResult = await executeQuery(checkClientQuery, { p_clientNo: clientno });

    if (checkResult.rows.length === 0) {
      res.status(404).send(`Client ID ${clientno} not found`);
      return;
    }

    // Update client
    const updateQuery = `
      UPDATE dh_client
      SET
        telno = :p_telno,
        email = :p_email,
        preftype = :p_preftype,
        maxrent = :p_maxrent
      WHERE clientno = :p_clientno
    `;

    const binds = {
      p_clientno: clientno,
      p_telno: telno || '',
      p_email: email || '',
      p_preftype: preftype || '',
      p_maxrent: maxrent || null,
    };

    await executeQuery(updateQuery, binds);

    res.status(200).send('Client information updated successfully');
  } catch (err: any) {
    console.error('Error updating client information:', err.message || err);
    res.status(500).send('Error updating client information');
  }
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  populateStaffHashMap();
});