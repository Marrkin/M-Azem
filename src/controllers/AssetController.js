const Asset = require('../models/Asset');
const XLSX = require('xlsx');

class AssetController {
    static async getAllAssets(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const name = req.query.name || '';
            const assetNumber = req.query.assetNumber || '';
            const location = req.query.location || '';

            const offset = (page - 1) * limit;

            let whereClause = '';
            const params = [];

            if (name) {
                whereClause += (whereClause ? ' AND ' : ' WHERE ') + 'name LIKE ?';
                params.push(`%${name}%`);
            }

            if (assetNumber) {
                whereClause += (whereClause ? ' AND ' : ' WHERE ') + 'asset_number LIKE ?';
                params.push(`%${assetNumber}%`);
            }

            if (location) {
                whereClause += (whereClause ? ' AND ' : ' WHERE ') + 'location = ?';
                params.push(location);
            }

            const [assets, totalCount, availableLocations] = await Promise.all([
                Asset.getAllFiltered(limit, offset, whereClause, params),
                Asset.getCountFiltered(whereClause, params),
                Asset.getDistinctLocations()
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            res.json({
                assets,
                availableLocations,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAssetById(req, res) {
        try {
            const asset = await Asset.getById(req.params.id);
            if (!asset) {
                return res.status(404).json({ error: 'Asset not found' });
            }
            res.json(asset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createAsset(req, res) {
        try {
            if (!req.body.asset_number || !req.body.name) {
                return res.status(400).json({ error: 'Asset Number and Name are required' });
            }
            const newAsset = await Asset.create(req.body);
            res.status(201).json(newAsset);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Asset Number already exists' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async updateAsset(req, res) {
        try {
            const updatedAsset = await Asset.update(req.params.id, req.body);
            res.json(updatedAsset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteAsset(req, res) {
        try {
            await Asset.delete(req.params.id);
            res.json({ message: 'Asset deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async exportAssetsExcel(req, res) {
        try {
            const assets = await Asset.getAll();

            const formattedData = assets.map(asset => ({
                'Identificação Patrimonial': asset.asset_number || '',
                'Nome': asset.name || '',
                'Quantidade': asset.quantity || 0,
                'Local': asset.location || '',
                'Descrição': asset.description || '',
                'Data de Criação': new Date(asset.created_at).toLocaleDateString('pt-BR')
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const colWidths = [
                { wch: 25 },
                { wch: 35 },
                { wch: 12 },
                { wch: 30 },
                { wch: 40 },
                { wch: 15 }
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Ativos');

            const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
            const filename = `ativos-${timestamp}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.send(buffer);

        } catch (error) {
            console.error('Excel export error:', error);
            res.status(500).json({ error: 'Failed to export assets to Excel' });
        }
    }
}

module.exports = AssetController;
