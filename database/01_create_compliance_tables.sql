CREATE TABLE dbo.ComplianceDenuncia (
    Codigo INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ComplianceDenuncia PRIMARY KEY,
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT UQ_ComplianceDenuncia_Id UNIQUE,
    Protocolo VARCHAR(40) NOT NULL CONSTRAINT UQ_ComplianceDenuncia_Protocolo UNIQUE,
    DataRegistro DATETIME2(0) NOT NULL CONSTRAINT DF_ComplianceDenuncia_DataRegistro DEFAULT SYSUTCDATETIME(),
    Anonima BIT NOT NULL,
    DenuncianteNome NVARCHAR(200) NULL,
    DenuncianteEmail NVARCHAR(200) NULL,
    DenuncianteTelefone NVARCHAR(50) NULL,
    TiposDenuncia NVARCHAR(500) NOT NULL,
    PrimeiroEpisodio DATE NULL,
    UltimoEpisodio DATE NULL,
    LocalOcorrencia NVARCHAR(200) NULL,
    Descricao NVARCHAR(MAX) NOT NULL,
    Envolvidos NVARCHAR(500) NOT NULL,
    CargoAreaEnvolvido NVARCHAR(200) NULL,
    Testemunhas NVARCHAR(500) NULL,
    DesejaContato BIT NOT NULL,
    CanalContato NVARCHAR(100) NULL,
    Declaracao BIT NOT NULL,
    Autorizacao BIT NOT NULL,
    Status VARCHAR(30) NOT NULL CONSTRAINT DF_ComplianceDenuncia_Status DEFAULT 'received'
);
CREATE TABLE dbo.ComplianceAnexo (
    Codigo INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ComplianceAnexo PRIMARY KEY,
    DenunciaCodigo INT NOT NULL,
    NomeOriginal NVARCHAR(255) NOT NULL,
    NomeArmazenado NVARCHAR(255) NOT NULL,
    MimeType NVARCHAR(150) NULL,
    TamanhoBytes BIGINT NOT NULL,
    CaminhoArquivo NVARCHAR(1000) NOT NULL,
    DataRegistro DATETIME2(0) NOT NULL CONSTRAINT DF_ComplianceAnexo_DataRegistro DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ComplianceAnexo_Denuncia FOREIGN KEY (DenunciaCodigo) REFERENCES dbo.ComplianceDenuncia(Codigo)
);
CREATE INDEX IX_ComplianceDenuncia_Protocolo ON dbo.ComplianceDenuncia(Protocolo);
CREATE INDEX IX_ComplianceDenuncia_Status ON dbo.ComplianceDenuncia(Status);
CREATE INDEX IX_ComplianceDenuncia_DataRegistro ON dbo.ComplianceDenuncia(DataRegistro);
CREATE INDEX IX_ComplianceAnexo_DenunciaCodigo ON dbo.ComplianceAnexo(DenunciaCodigo);
