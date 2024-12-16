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
    note TEXT
);

CREATE TABLE locks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) ,
    lock_number VARCHAR(255) ,
    zone_id VARCHAR(255) , 
    size VARCHAR(255) ,
    status VARCHAR(255) ,
    active BOOLEAN 
);

CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    contract_number VARCHAR(255) UNIQUE NOT NULL,
    tenant_id INT ,
    lock_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(255),
    rent_rate decimal,
    water_rate decimal,
    electric_rate decimal
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    contract_id INT REFERENCES contracts(id),
    contract_type VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL
);


CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(255) UNIQUE NOT NULL,
    bill_type VARCHAR(255) NOT NULL,
    contract_id INT REFERENCES contracts(id),
    tenant_id INT REFERENCES tenants(id),
    month VARCHAR(255) NOT NULL,
    rent decimal,
    water decimal,
    electric decimal,
    discount decimal,
    total decimal,
    status VARCHAR(255),
);

CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    pic VARCHAR(255),
    name VARCHAR(255)  NOT NULL , 
    status VARCHAR(255)
);