
class CrudOperations {
    dbModel: any;
 
   constructor(dbModel: any) {
     this.dbModel = dbModel;
   }
 
   save(obj: any){
     const model = new this.dbModel(obj);
     return model.save(obj);
   }
   
   insertOrUpdate(query: any, document: any) {
     return this.dbModel.findOneAndUpdate(
       query,
       document,
       { upsert: true, new: true }
     );
   }
 
   updateManyDocuments(
     query: any,
     docs: any,
     options: any,
   ){
     return this.dbModel.updateMany(query, docs, options);
   }
 
   getDocument(query: any, projections: any) {
     return this.dbModel.findOne(query, projections);
   }
 
   getDocumentById(id: any, projections: any) {
     return this.dbModel.findById(id, projections);
   }
  
   getAllDocuments(
     query: any,
     sort: any,
     limit: any,
   ) {
     return this.dbModel
       .find(query)
       .sort(sort ? sort : { createdAt: -1})
       .limit(limit)
       .lean();
   }

   countAllDocuments(query: any) {
     //count method deprecated, will be removed in later versions
     return this.dbModel.countDocuments(query).lean();
   }
 
   updateDocument(query: any, doc: any) {
     return this.dbModel
       .findOneAndUpdate(query, { $set: doc }, { new: true })
       .lean();
   }
 
   updateOneDocument(query: any, doc: any) {
     return this.dbModel
       .findOneAndUpdate(query, doc, { new: true })
       .lean();
   }
 
   deleteDocument(query: any){
     return this.dbModel.deleteOne(query);
   }

   cummumulativeScoreDocument(studentId: any){
    return this.dbModel.aggregate([
      { $match: { student_id: studentId } },
      { $group: { _id: "$student_id", totalScore: { $sum: "$score" } } }
    ]);
   }

   lessonWiseScoreDocument(studentId:any){
    return this.dbModel.aggregate([
      { 
        $match: { student_id: studentId }
      },
      {
        $group: {
          _id: "$lesson_master_id",
          totalScore: { $sum: "$score" }
        }
      },
      {
        $lookup: {
          from: "emis_lessons_masters",
          localField: "_id",
          foreignField: "lesson_master_id",
          as: "lessonDetails"
        }
      },
      { 
        $unwind: "$lessonDetails" 
      },
      {
        $project: {
          lesson_master_id: "$_id",
          score: "$totalScore",
          lesson_id: "$lessonDetails.lesson_id"
        }
      }
    ]);
   }
 
 }
 
 export default CrudOperations;
 