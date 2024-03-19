
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
 
   insertManyDocuments(
     docs: any,
     options: any
   ){
     return this.dbModel.insertMany(docs, options);
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
    //  projections: any,
    //  options: any,//page,limit
     sort: any
   ) {
     //const offset = options.limit * options.pageNo;
     return this.dbModel
       .find(query) //projections)
       //.skip(offset)
       //.limit(options.limit)
       .sort(sort ? sort : { createdAt: -1})
       .lean();
   }
 
   countAllDocuments(query: any) {
     //count method deprecated, will be removed in later versions
     return this.dbModel.countDocuments(query).lean();
   }
 
   
   createAndUpdateDocumentByEmail(doc: any) {
     return this.dbModel.findOneAndUpdate({ email: doc.email }, doc, {
       new: true,
       upsert: true,
     });
   }
 
   upsertWithUpdateQuery(query: any ,updateQuery: any) {
     return this.dbModel.findOneAndUpdate(query, updateQuery, {
       upsert: true,
       new: true,
     });
   }
 
   upsertWithReturnDocuments(query: any,updateObj: any) {
     return this.dbModel.findOneAndUpdate(
       query,
       { $set: updateObj },
       { upsert: true, new: true }
     );
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
 
   updateAllDocuments(query: any, doc: any){
     return this.dbModel.updateMany(query, { $set: doc }, { new: true });
   }
 
   updateSubDocument(query: any, doc: any, options: any) {
     return this.dbModel.update(query, { $push: doc }, options);
   }
 
   deleteDocument(query: any){
     return this.dbModel.deleteOne(query);
   }
 
   deleteAllDocuments(query: any){
     return this.dbModel.deleteMany(query);
   }
 
   getSchema() {
     return this.dbModel.schema;
   }
 }
 
 export default CrudOperations;
 