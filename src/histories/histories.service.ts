import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoriesService {
    constructor(private readonly prisma: PrismaService) {}

    async storeHistoryNew(
        dataItemType: number,
        dataItemID: number
    ) {
        return await this.storeHistoryCategorized(dataItemType, dataItemID, '!newEntry!', '(USER) created entry.', 1);
    }

    async storeHistoryCategorized(
        dataItemType: number,
        dataItemID: number,
        category: string | null,
        description: string | null,
        userID: number,
    ): Promise<void> {
        await this.prisma.history.create({
            data: {
                data_item_type: dataItemType,
                data_item_id: dataItemID,
                the_field: category,
                previous_value: null,
                new_value: null,
                description: description,
                entered_by: userID,
                site_id: 1
            },
        });
    }

    async storeHistoryChanges(
        dataItemType: number,
        dataItemID: number,
        preHistory: Record<string, any>,
        postHistory: Record<string, any>,
        userID: number,
    ): Promise<void> {
        const changedHistory: string[] = [];
        let causedHistory = false;

        // Drop fields that change too often
        delete preHistory['dateModified'];

        // Find out what changed, store it in changedHistory
        Object.keys(preHistory).forEach((key) => {
        if (preHistory[key] !== postHistory[key]) {
            causedHistory = true;
            changedHistory.push(key);
        }
        });

        if (!causedHistory) {
        return;
        }

        // Make a description
        const description = `(USER) changed field(s): ${changedHistory.join(', ')}.`;

        // Build new history entry entries
        const historyEntries = changedHistory.map((field, index) => {
            return {
                data_item_type: dataItemType,
                data_item_id: dataItemID,
                the_field: field,
                previous_value: preHistory[field] ?? null,
                new_value: postHistory[field] ?? null,
                description: index === changedHistory.length - 1 ? description : null,
                entered_by: userID,
                site_id: 1
            };
        });

        // Bulk insert into history table
        await this.prisma.history.createMany({
            data: historyEntries,
        });
    }
}
