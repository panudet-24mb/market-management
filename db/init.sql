CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255),
    prefix VARCHAR(255) ,
    first_name VARCHAR(255) ,
    last_name VARCHAR(255) ,
    nick_name VARCHAR(255),
    contact VARCHAR(255) ,
    phone VARCHAR(255) ,
    address VARCHAR(255) ,
    profile_image VARCHAR(255),
    line_id VARCHAR(255),
    line_name VARCHAR(255),
    line_register BOOLEAN,
    line_img VARCHAR(255),
    note TEXT
);


CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    contract_id INT ,
    contract_type VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL
);

CREATE TABLE meters (
    id SERIAL PRIMARY KEY,
    meter_type VARCHAR(255) ,
    meter_number VARCHAR(255) ,
    meter_serial VARCHAR(255),
    note TEXT,
    asset_tag VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE contract_have_meters (
    id SERIAL PRIMARY KEY,
    contract_id INT ,
    meter_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE meter_usages (
    id SERIAL PRIMARY KEY,
    meter_id INT,
    meter_start INT,
    meter_end INT,
    meter_usage INT ,
    note TEXT,
    img_path VARCHAR(255),
    status VARCHAR(255),
    client_id INT,
    company_id INT,
    created_by INT ,
    confirmedby INT , --ID ผู้คอนเฟริมว่าใครได้ยืนยัน
    date_check DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);



CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(255) UNIQUE NOT NULL,
    bill_type VARCHAR(255) NOT NULL,
    contract_id INT ,
    tenant_id INT ,
    month VARCHAR(255) NOT NULL,
    year VARCHAR(255) NOT NULL,
    rent decimal,
    water decimal,
    electric decimal,
    discount decimal,
    total decimal,
    status VARCHAR(255)
);

CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    pic VARCHAR(255),
    name VARCHAR(255)  NOT NULL , 
    status VARCHAR(255)
);


CREATE TABLE lock_has_contracts (
    id SERIAL PRIMARY KEY,
    contract_id INT , 
    lock_id INT ,
    status VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP 
);


CREATE TABLE locks (
    id SERIAL PRIMARY KEY,
    lock_name VARCHAR(255) ,
    lock_number VARCHAR(255) ,
    zone_id INT , 
    size VARCHAR(255) ,
    status VARCHAR(255) ,
    active BOOLEAN 
);

CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    contract_number VARCHAR(255) UNIQUE NOT NULL,
    contract_name VARCHAR(255),
    tenant_id INT ,
    lock_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(255),
    rent_rate decimal,
    water_rate decimal,
    electric_rate decimal,
    advance decimal,
    deposit decimal,
    note TEXT
);


CREATE TABLE lock_reserves (
    id SERIAL PRIMARY KEY,  
    lock_id INT,
    status VARCHAR(255),
    contract_name VARCHAR(255),
    contract_type VARCHAR(255),
    contract_number VARCHAR(255),
    contract_note TEXT,
    deposit decimal,
    advance decimal,
    client_id INT,
    company_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
)

CREATE TABLE lock_reserves_has_attachments (
    id SERIAL PRIMARY KEY,  
    lock_reserve_id INT,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
)

CREATE TABLE pre_calling(
    id SERIAL PRIMARY KEY,
    call_number VARCHAR(255),
    status VARCHAR(255),
    client_id INT,
    company_id INT,
    note TEXT,
    created_by  INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
)




CREATE TABLE lock_has_meter(
    id SERIAL PRIMARY KEY,
    lock_id INT,
    meter_id INT,
    status VARCHAR(255),
    note TEXT,
    company_id INT,
    client_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
)